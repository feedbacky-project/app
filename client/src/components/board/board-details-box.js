import React, {useContext, useState} from 'react';
import {FaPencilAlt} from "react-icons/fa";
import {Button, Card, Col} from "react-bootstrap";
import IdeaCreateModal from "components/modal/idea-create-modal";
import AppContext from "context/app-context";
import {Link} from "react-router-dom";
import snarkdown from "components/util/snarkdown";
import {FaAlignRight} from "react-icons/all";
import {parseEmojis} from "components/util/emoji-filter";

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
        }} className="text-white mx-0 mt-0 py-1 float-right" variant="" style={{backgroundColor: context.theme}}>
            Manage <FaAlignRight className="ml-1 move-top-1px"/>
        </Button>
    };

    return <React.Fragment>
        <IdeaCreateModal open={open} discriminator={props.discriminator}
                         onCreateIdeaModalClose={onCreateIdeaModalClose} onIdeaCreation={props.onIdeaCreation}/>
        <Col id="boardDetails" lg={4} className="order-lg-12 order-1">
            <Card className="my-2 text-left" style={{borderRadius: 0}}>
                <Card.Body className="pb-2">
                    <div className="markdown-box" dangerouslySetInnerHTML={{__html: parseEmojis(snarkdown(props.description))}}/>
                    <hr/>
                    <Button className="text-white mx-0 mt-0 mb-2 py-1" variant="" style={{backgroundColor: context.theme}} onClick={onCreateIdeaModalClick}>
                        <FaPencilAlt className="mr-1 move-top-1px"/> New Idea
                    </Button>
                    {renderEditButton()}
                </Card.Body>
            </Card>
        </Col>
    </React.Fragment>
};

export default BoardDetailsBox;