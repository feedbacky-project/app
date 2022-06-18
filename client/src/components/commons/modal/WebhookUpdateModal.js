import styled from "@emotion/styled";
import axios from "axios";
import {AppContext} from "context";
import React, {useContext, useEffect, useRef, useState} from "react";
import {UiBadge, UiKeyboardInput, UiLabelledCheckbox, UiThemeContext} from "ui";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiFormControl, UiFormLabel} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {popupError, popupNotification, popupWarning, prettifyTrigger} from "utils/basic-utils";

const SelectableTag = styled.div`
  width: 130px;
  flex-grow: 1;
  display: inline-block;
  margin-right: .5rem;
  cursor: pointer;
`;

//https://stackoverflow.com/a/43467144/10156191
const isValidHttpUrl = (string) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

const WebhookUpdateModal = ({isOpen, onHide, webhook, onWebhookUpdate}) => {
    const {serviceData} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const [chosenTriggers, setChosenTriggers] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const ref = useRef();
    useEffect(() => {
        setChosenTriggers(webhook.triggers || []);
    }, [webhook.triggers]);

    const onUpdate = () => {
        const url = document.getElementById("urlTextarea").value;
        if (url.length < 10 || !isValidHttpUrl(url)) {
            popupWarning("URL is invalid");
            return Promise.resolve();
        }
        if (chosenTriggers.length === 0) {
            popupWarning("No webhook triggers chosen.");
            return Promise.resolve();
        }
        return axios.patch("/webhooks/" + webhook.id, {
            url, triggers: chosenTriggers, type: webhook.type
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            popupNotification("Webhook updated", getTheme());
            onHide();
            onWebhookUpdate(res.data);
        });
    };
    const applyButton = <UiLoadableButton label={"Update"} onClick={onUpdate} className={"mx-0"}>Update</UiLoadableButton>;
    const renderCommonTriggers = () => {
        //board triggers unsupported for webhooks
        let triggers = Object.keys(serviceData.actionTriggers).filter(c => c !== "board");
        if (!showAll) {
            triggers = triggers.filter(c => c === "idea" || c === "comment");
        }

        return triggers.map((category, j) => {
            const update = (trigger) => {
                let newTriggers;
                if (chosenTriggers.includes(trigger)) {
                    newTriggers = chosenTriggers.filter(t => t !== trigger);
                } else {
                    newTriggers = chosenTriggers.concat(trigger);
                }
                // https://stackoverflow.com/a/39225750/10156191
                setTimeout(() => setChosenTriggers(newTriggers), 0);
            };
            return <UiCol as={UiRow} xs={12} key={category + j} className={"mb-2 px-0"}>
                <UiCol xs={12} className={"font-weight-bold"}>Triggers for <UiKeyboardInput>{category}</UiKeyboardInput></UiCol>
                {serviceData.actionTriggers[category].map((trigger, i) => {
                    return <SelectableTag xs={6} sm={4} as={UiCol} key={i} onClick={() => update(trigger)} className={"d-inline-block pr-0 mx-0"} style={{letterSpacing: "-.1pt", wordSpacing: "-.2pt"}}>
                        <UiLabelledCheckbox id={"applicableTrigger_" + trigger} checked={chosenTriggers.includes(trigger)} onChange={update}
                                            label={<UiBadge color={getTheme()}>{prettifyTrigger(category, trigger)}</UiBadge>}/>
                    </SelectableTag>
                })}
            </UiCol>
        })
    };
    const renderButton = () => {
        if (showAll) {
            return <UiButton label={"Hide Advanced Triggers"} className={"mt-2"} small onClick={() => setShowAll(false)}>Hide Advanced Triggers</UiButton>
        }
        return <UiButton label={"Show Advanced Triggers"} className={"mt-2"} small onClick={() => setShowAll(true)}>Show Advanced Triggers</UiButton>
    }
    return <UiDismissibleModal id={"webhookUpdate"} isOpen={isOpen} onHide={onHide} title={"Update Webhook"} applyButton={applyButton} onEntered={() => ref.current && ref.current.focus()} size={"lg"}>
        <div className={"mt-2 mb-1"}>
            <UiFormLabel>URL</UiFormLabel>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormControl minLength={0} maxLength={250} rows={1} type={"text"} defaultValue={webhook.url} placeholder={"Brief and descriptive title."}
                                   id={"urlTextarea"} label={"Webhook URL"} innerRef={ref}/>
                </UiCol>
            </UiCol>
        </div>
        <br/>
        <div className={"my-2"}>
            <UiFormLabel>Listened Events</UiFormLabel>
            {renderCommonTriggers()}
            <div className={"text-center"}>
                {renderButton()}
            </div>
        </div>
    </UiDismissibleModal>
};

export default WebhookUpdateModal;