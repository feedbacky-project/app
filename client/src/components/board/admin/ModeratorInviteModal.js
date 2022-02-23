import axios from "axios";
import {AppContext, BoardContext} from "context";
import React, {useContext, useRef} from 'react';
import {UiLoadableButton} from "ui/button";
import {UiFormControl, UiFormLabel} from "ui/form";
import {UiDismissibleModal} from "ui/modal";
import {popupError, popupNotification, popupWarning} from "utils/basic-utils";

const ModeratorInviteModal = ({onHide, onModInvitationSend, isOpen}) => {
    const {getTheme} = useContext(AppContext);
    const {data} = useContext(BoardContext);
    const ref = useRef();

    const handleSubmit = () => {
        const userEmail = document.getElementById("inviteEmailTextarea").value;
        if (userEmail === "" || !userEmail.match(/\S+@\S+\.\S+/)) {
            popupWarning("Please provide valid email address");
            return Promise.resolve();
        }
        return axios.post("/boards/" + data.discriminator + "/moderators", {
            userEmail,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            onHide();
            let mod = res.data;
            mod.role = "moderator";
            onModInvitationSend(mod);
            popupNotification("Invitation to " + res.data.user.username + " sent", getTheme());
        });
    };

    return <UiDismissibleModal id={"moderatorInvite"} size={"sm"} isOpen={isOpen} onHide={onHide} title={"Invite New Moderator"}
                               applyButton={<UiLoadableButton label={"Invite"} onClick={handleSubmit} className={"mx-0"}>Invite</UiLoadableButton>}
                               onEntered={() => ref.current && ref.current.focus()}>
        <div className={"mt-2 mb-1"}>
            <UiFormLabel>User Email</UiFormLabel>
            <UiFormControl innerRef={ref} type={"email"} placeholder={"Existing user email."} id={"inviteEmailTextarea"} label={"Type email"}/>
        </div>
    </UiDismissibleModal>
};

export default ModeratorInviteModal;