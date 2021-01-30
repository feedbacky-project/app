import IdeaCreateModal from "components/board/IdeaCreateModal";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext, useState} from 'react';
import {Card} from "react-bootstrap";
import {FaAlignRight} from "react-icons/all";
import {FaPencilAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiCol} from "ui/grid";
import {parseMarkdown} from "utils/basic-utils";

const BoardInfoCard = ({onIdeaCreation}) => {
    const {user} = useContext(AppContext);
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
        const contains = data.moderators.find(mod => mod.userId === user.data.id && mod.role === "OWNER");
        if (!contains) {
            return;
        }
        return <UiButton as={Link} to={{
            pathname: "/ba/" + data.discriminator,
            state: {
                _boardData: data,
            },
        }} className={"mx-0 mt-0 py-1 float-right"}>
            Manage <FaAlignRight className={"ml-1 move-top-1px"}/>
        </UiButton>
    };

    return <React.Fragment>
        <IdeaCreateModal isOpen={open} onHide={() => setOpen(false)} onIdeaCreation={onIdeaCreation}/>
        <UiCol xs={{span: 12, order: 1}} lg={{span: 4, order: 12}}>
            <Card className={"my-2 text-left"}>
                <Card.Body className={"pb-2"}>
                    <div className={"markdown-box"} dangerouslySetInnerHTML={{__html: parseMarkdown(data.fullDescription)}}/>
                    <hr/>
                    {/* eslint-disable-next-line */}
                    <UiLoadableButton tabindex={1} className={"mx-0 mt-0 mb-2 py-1"} onClick={() => {
                        onCreateIdeaModalClick();
                        return Promise.resolve();
                    }}>
                        <FaPencilAlt className={"mr-1 move-top-1px"}/> New Idea
                    </UiLoadableButton>
                    {renderEditButton()}
                </Card.Body>
            </Card>
        </UiCol>
    </React.Fragment>
};

export default BoardInfoCard;