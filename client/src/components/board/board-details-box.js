import React, {useContext, useState} from 'react';
import {FaPencilAlt} from "react-icons/fa";
import {Card, Col} from "react-bootstrap";
import IdeaCreateModal from "components/modal/idea-create-modal";
import AppContext from "context/app-context";
import {Link} from "react-router-dom";
import {FaAlignRight} from "react-icons/all";
import {parseMarkdown} from "components/util/utils";
import BoardContext from "context/board-context";
import ExecutableButton from "../app/executable-button";
import PageButton from "../app/page-button";

const BoardDetailsBox = ({onIdeaCreation, onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const [open, setOpen] = useState(false);
    const onCreateIdeaModalClick = () => {
        if (!context.user.loggedIn) {
            onNotLoggedClick();
            return;
        }
        setOpen(true);
    };
    const renderEditButton = () => {
        const contains = boardData.moderators.find(mod => mod.userId === context.user.data.id && mod.role === "OWNER");
        if (!contains) {
            return;
        }
        return <PageButton color={context.getTheme()} as={Link} to={{
            pathname: "/ba/" + boardData.discriminator,
            state: {
                _boardData: boardData,
            },
        }} className="mx-0 mt-0 py-1 float-right">
            Manage <FaAlignRight className="ml-1 move-top-1px"/>
        </PageButton>
    };

    return <React.Fragment>
        <IdeaCreateModal open={open} onCreateIdeaModalClose={() => setOpen(false)} onIdeaCreation={onIdeaCreation}/>
        <Col id="boardDetails" lg={4} className="order-lg-12 order-1">
            <Card className="my-2 text-left" style={{borderRadius: 0}}>
                <Card.Body className="pb-2">
                    <div className="markdown-box" dangerouslySetInnerHTML={{__html: parseMarkdown(boardData.fullDescription)}}/>
                    <hr/>
                    <ExecutableButton color={context.getTheme()} className="mx-0 mt-0 mb-2 py-1" onClick={() => {
                        onCreateIdeaModalClick();
                        return Promise.resolve();
                    }}>
                        <FaPencilAlt className="mr-1 move-top-1px"/> New Idea
                    </ExecutableButton>
                    {renderEditButton()}
                </Card.Body>
            </Card>
        </Col>
    </React.Fragment>
};

export default BoardDetailsBox;