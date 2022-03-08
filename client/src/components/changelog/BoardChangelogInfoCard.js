import {BoardDescription} from "components/board/BoardInfoCard";
import ChangelogCreateModal from "components/changelog/ChangelogCreateModal";
import {AppContext, BoardContext} from "context";
import React, {useContext, useState} from 'react';
import {FaPencilAlt} from "react-icons/fa";
import {UiCard, UiHorizontalRule} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiCol} from "ui/grid";

const BoardChangelogInfoCard = ({onChangelogCreation}) => {
    const {user} = useContext(AppContext);
    const {data} = useContext(BoardContext);
    const [open, setOpen] = useState(false);

    const renderButtons = () => {
        const contains = data.moderators.find(mod => mod.userId === user.data.id && (mod.role === "ADMINISTRATOR" || mod.role === "OWNER"));
        if (!contains) {
            return;
        }
        return <React.Fragment>
            <UiHorizontalRule className={"pb-1"}/>
            {/* eslint-disable-next-line */}
            <UiLoadableButton label={"Post Changelog"} tabIndex={1} className={"py-1"} onClick={() => {
                setOpen(true);
                return Promise.resolve();
            }}>
                <FaPencilAlt className={"mr-1 move-top-1px"}/> Post Changelog
            </UiLoadableButton>
        </React.Fragment>
    };

    return <UiCol xs={{span: 12, order: 1}} lg={{span: 4, order: 12}}>
        <ChangelogCreateModal isOpen={open} onHide={() => setOpen(false)} onChangelogCreation={onChangelogCreation}/>
        <UiCard className={"my-2 text-left"}>
            <BoardDescription text={data.fullDescription}/>
            {renderButtons()}
        </UiCard>
    </UiCol>
};

export default BoardChangelogInfoCard;