import IdeaCreateModal from "components/board/IdeaCreateModal";
import MarkdownContainer from "components/commons/MarkdownContainer";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext, useState} from 'react';
import {FaAlignRight} from "react-icons/all";
import {FaPencilAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiCard, UiHorizontalRule} from "ui";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiCol} from "ui/grid";

const BoardInfoCard = ({onIdeaCreation}) => {
    const {user, getTheme} = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const [open, setOpen] = useState(false);
    const onCreateIdeaModalClick = () => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return;
        }
        setOpen(true);
    };
    const renderEditButton = () => {
        const contains = data.moderators.find(mod => mod.userId === user.data.id && (mod.role === "ADMINISTRATOR" || mod.role === "OWNER"));
        if (!contains) {
            return;
        }
        return <UiButton label={"Edit Board"} as={Link} to={{pathname: "/ba/" + data.discriminator, state: {_boardData: data}}} className={"py-1 float-right"}>
            Manage <FaAlignRight className={"ml-1 move-top-1px"}/>
        </UiButton>
    };

    return <UiCol xs={{span: 12, order: 1}} lg={{span: 4, order: 12}}>
        <IdeaCreateModal isOpen={open} onHide={() => setOpen(false)} onIdeaCreation={onIdeaCreation}/>
        <UiCard className={"my-2 text-left"}>
            <MarkdownContainer text={data.fullDescription}/>
            <UiHorizontalRule theme={getTheme().setAlpha(.1)} className={"pb-1"}/>
            {/* eslint-disable-next-line */}
            <UiLoadableButton label={"Create Idea"} tabIndex={1} className={"py-1"} onClick={() => {
                onCreateIdeaModalClick();
                return Promise.resolve();
            }}>
                <FaPencilAlt className={"mr-1 move-top-1px"}/> New Idea
            </UiLoadableButton>
            {renderEditButton()}
        </UiCard>
    </UiCol>
};

export default BoardInfoCard;