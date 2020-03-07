import React, {useContext, useState} from 'react';
import {FaPencilAlt} from "react-icons/fa";
import {Button, Card, Col} from "react-bootstrap";
import IdeaCreateModal from "../modal/IdeaCreateModal";
import AppContext from "../../context/AppContext";
import {GoProject} from "react-icons/go";
import {Link} from "react-router-dom";
import snarkdown from "../util/snarkdown";
import Attribution from "../util/Attribution";

const BoardDetailsBox = (props) => {
    const context = useContext(AppContext);
    const [open, setOpen] = useState(false);
    const onCreateIdeaModalClick = () => {
        if (!context.user.loggedIn) {
            props.onNotLoggedClick();
            return;
        }
        setOpen(true);
    };
    const onCreateIdeaModalClose = () => {
        setOpen(false);
    };

    const renderEditButton = () => {
        const contains = props.moderators.find(mod => mod.userId === context.user.data.id && mod.role === "OWNER");
        if (!contains) {
            return;
        }
        return <Button as={Link} to={{
            pathname: "/ba/" + props.discriminator,
            state: {
                _boardData: props.boardData,
            },
        }} className="btn-smaller black-text mx-0 mt-0 mb-2 mr-1 py-1 ml-1 grey lighten-4" variant="">
            <GoProject className="mr-1"/> Manage
        </Button>
    };

    return <React.Fragment>
        <IdeaCreateModal open={open} discriminator={props.discriminator}
                         onCreateIdeaModalClose={onCreateIdeaModalClose} onIdeaCreation={props.onIdeaCreation}/>
        <Col id="boardDetails" lg={4} className="order-lg-12 order-1">
            <Card className="my-2 text-left" style={{borderRadius: 0}}>
                <Card.Body className="pb-2">
                    <div className="markdown-box" dangerouslySetInnerHTML={{__html: snarkdown(props.description)}}/>
                    <hr/>
                    <Button className="btn-smaller text-white mx-0 mt-0 mb-2 mr-1 py-1" variant=""
                            style={{backgroundColor: context.theme}} onClick={onCreateIdeaModalClick}>
                        <FaPencilAlt className="mr-1"/> New Idea
                    </Button>
                    {renderEditButton()}
                </Card.Body>
            </Card>
            <Attribution/>
        </Col>
    </React.Fragment>
};

export default BoardDetailsBox;