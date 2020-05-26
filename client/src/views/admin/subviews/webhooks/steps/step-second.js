import React from 'react';
import {Col, Row} from "react-bootstrap";
import CardGroup from "react-bootstrap/CardGroup";
import UndrawChooseEvents from "assets/svg/undraw/choose_events.svg";
import SetupCard from "components/app/setup-card";

const events = ["IDEA_CREATE", "IDEA_DELETE", "IDEA_COMMENT", "IDEA_COMMENT_DELETE", "IDEA_EDIT", "IDEA_TAG_CHANGE", "IDEA_OPEN", "IDEA_CLOSE"];
const eventNames = ["Idea Post Create", "Idea Post Delete", "Idea Comment Post", "Idea Comment Delete", "Idea Post Edited", "Idea Tag Change", "Idea State Open", "Idea State Close"];
const eventIcons = ["idea_create.svg", "idea_delete.svg", "idea_comment.svg", "idea_comment_delete.svg", "idea_edit.svg", "idea_tag_change.svg", "idea_open.svg", "idea_close.svg"];

const StepSecond = (props) => {
    const renderCards = () => {
        return events.map((item, i) => {
            let name = eventNames[i];
            let classes = "rounded-xl mb-3 mx-2";
            if (props.events.includes(item)) {
                classes += " border-chosen";
            } else {
                classes += " border-invisible";
            }
            return <SetupCard key={i} icon={<img alt={item} src={"https://cdn.feedbacky.net/static/svg/webhooks/" + eventIcons[i]} style={{width: "2.5rem", height: "2.5rem"}}/>}
                              text={name} onClick={() => props.onSetupMethodCall("event", item)} className={classes}/>
        });
    };

    return <React.Fragment>
        <Col xs={12} className="mt-4 text-center">
            <img alt="" src={UndrawChooseEvents} className="my-2" width={150} height={150}/>
            <h2>Choose Listened Events</h2>
            <span className="text-black-60">
                Select events that this webhook will listen for.
            </span>
        </Col>
        <Col xs={12} className="mt-4 px-md-5 px-3">
            <Row className="justify-content-center">
                <CardGroup className="col-10 justify-content-center">
                    {renderCards()}
                </CardGroup>
            </Row>
        </Col>
    </React.Fragment>
};

export default StepSecond;