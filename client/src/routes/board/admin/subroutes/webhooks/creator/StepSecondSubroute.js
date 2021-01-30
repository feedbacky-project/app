import UndrawChooseEvents from "assets/svg/undraw/choose_events.svg";
import SetupCard from "components/board/admin/SetupCard";
import React from 'react';
import CardGroup from "react-bootstrap/CardGroup";
import {UiCol, UiRow} from "ui/grid";

const events = ["IDEA_CREATE", "IDEA_DELETE", "IDEA_COMMENT", "IDEA_COMMENT_DELETE", "IDEA_EDIT", "IDEA_TAG_CHANGE", "IDEA_OPEN", "IDEA_CLOSE"];
const eventNames = ["Idea Post Create", "Idea Post Delete", "Idea Comment Post", "Idea Comment Delete", "Idea Post Edited", "Idea Tag Change", "Idea State Open", "Idea State Close"];
const eventIcons = ["idea_create.svg", "idea_delete.svg", "idea_comment.svg", "idea_comment_delete.svg", "idea_edit.svg", "idea_tag_change.svg", "idea_open.svg", "idea_close.svg"];

const StepSecondSubroute = ({updateSettings, settings}) => {
    const onChoose = (item) => {
        if (settings.listenedEvents.includes(item)) {
            updateSettings({...settings, listenedEvents: settings.listenedEvents.filter(event => event !== item)});
        } else {
            updateSettings({...settings, listenedEvents: [...settings.listenedEvents, item]});
        }
    };
    const renderCards = () => {
        return events.map((item, i) => {
            let name = eventNames[i];
            return <SetupCard key={i} icon={<img alt={item} src={"https://cdn.feedbacky.net/static/svg/webhooks/" + eventIcons[i]} style={{width: "2.5rem", height: "2.5rem"}}/>}
                              text={name} onClick={() => onChoose(item)} className={"mb-3 mx-2"} chosen={settings.listenedEvents.includes(item)}/>
        });
    };

    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawChooseEvents} className={"my-2"} width={150} height={150}/>
            <h2>Choose Listened Events</h2>
            <span className={"text-black-60"}>
                Select events that this webhook will listen for.
            </span>
        </UiCol>
        <UiCol xs={12} className={"mt-4 px-md-5 px-3"}>
            <UiRow centered>
                <CardGroup>
                    {renderCards()}
                </CardGroup>
            </UiRow>
        </UiCol>
    </React.Fragment>
};

export default StepSecondSubroute;