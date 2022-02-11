import styled from "@emotion/styled";
import axios from "axios";
import {AppContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {WEBHOOK_EVENT_LIST} from "routes/board/admin/subroutes/webhooks/creator/StepSecondSubroute";
import {UiBadge, UiLabelledCheckbox} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormControl, UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {popupError, popupNotification, popupWarning, prettifyEnum, truncateText} from "utils/basic-utils";

const FlexContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: stretch;
`;

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
    const {getTheme} = useContext(AppContext);
    const [chosenEvents, setChosenEvents] = useState([]);
    useEffect(() => {
        setChosenEvents(webhook.events || []);
    }, [webhook.events]);

    const handleSubmit = () => {
        const url = document.getElementById("urlTextarea").value;
        if (url.length < 10 || !isValidHttpUrl(url)) {
            popupWarning("URL is invalid");
            return Promise.resolve();
        }
        if (chosenEvents.length === 0) {
            popupWarning("No webhook events chosen.");
            return Promise.resolve();
        }
        return axios.patch("/webhooks/" + webhook.id, {
            url, events: chosenEvents, type: webhook.type
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

    return <UiDismissibleModal id={"webhookUpdate"} isOpen={isOpen} onHide={onHide} title={"Update Webhook"}
                               applyButton={<UiLoadableButton label={"Update"} onClick={handleSubmit} className={"mx-0"}>Update</UiLoadableButton>}>
        <div className={"mt-2 mb-1"}>
            <UiFormLabel>URL</UiFormLabel>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormControl minLength={0} maxLength={250} rows={1} type={"text"} defaultValue={webhook.url} placeholder={"Brief and descriptive title."} id={"urlTextarea"} label={"Webhook URL"}/>
                </UiCol>
            </UiCol>
        </div>
        <br/>
        <div className={"my-2"}>
            <UiFormLabel>Listened Events</UiFormLabel>
            <FlexContainer>
                {WEBHOOK_EVENT_LIST.map((event, i) => {
                    const update = () => {
                        let newEvents;
                        if (chosenEvents.includes(event)) {
                            newEvents = chosenEvents.filter(t => t !== event);
                        } else {
                            newEvents = chosenEvents.concat(event);
                        }
                        // https://stackoverflow.com/a/39225750/10156191
                        setTimeout(() => setChosenEvents(newEvents), 0);
                    };
                    return <SelectableTag key={i} onClick={update} className={"d-inline-block"} style={{letterSpacing: "-.25pt"}}>
                        <UiLabelledCheckbox id={"applicableEvent_" + event} checked={chosenEvents.includes(event)} onChange={update}
                                            label={<UiBadge color={getTheme()}>{truncateText(prettifyEnum(event), 16)}</UiBadge>}/>
                    </SelectableTag>
                })}
                {/* for uneven amount of tags add a dummy div(s) for even flex stretch*/}
                {WEBHOOK_EVENT_LIST.length % 3 === 1 || <SelectableTag/>}
                {WEBHOOK_EVENT_LIST.length % 3 === 2 || <SelectableTag/>}
            </FlexContainer>
        </div>
    </UiDismissibleModal>
};

export default WebhookUpdateModal;