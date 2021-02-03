import UndrawChooseEvents from "assets/svg/undraw/choose_events.svg";
import SetupCard from "components/board/admin/SetupCard";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import React from 'react';
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
                              text={name} onClick={() => onChoose(item)} className={"m-2"} chosen={settings.listenedEvents.includes(item)}/>
        });
    };

    return <React.Fragment>
        <SetupImageBanner svg={UndrawChooseEvents} stepName={"Choose Listened Events"} stepDescription={"Select events that this webhook will listen for."}/>
        <UiCol xs={12} className={"mt-4"}>
            <UiCol centered as={UiRow} className={"mx-0"} xs={12}>
                {renderCards()}
            </UiCol>
        </UiCol>
    </React.Fragment>
};

export default StepSecondSubroute;