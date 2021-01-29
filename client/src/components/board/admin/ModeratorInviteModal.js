import axios from "axios";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import Form from "react-bootstrap/Form";
import UiLoadableButton from "ui/button/UiLoadableButton";
import UiAvatar from "ui/image/UiAvatar";
import UiModal from "ui/UiModal";
import {toastAwait, toastError, toastSuccess, toastWarning} from "utils/basic-utils";

const ModeratorInviteModal = ({onHide, onModInvitationSend, isOpen}) => {
    const {data} = useContext(BoardContext);
    const handleSubmit = () => {
        const userEmail = document.getElementById("inviteEmailTextarea").value;
        if(userEmail === "" || !userEmail.match(/\S+@\S+\.\S+/)) {
            toastWarning("Please provide valid email address.");
            return Promise.resolve();
        }
        const toastId = toastAwait("Sending invitation...");
        return axios.post("/boards/" + data.discriminator + "/moderators", {
            userEmail,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            onHide();
            let mod = res.data;
            mod.role = "moderator";
            onModInvitationSend(mod);
            const toastMsg = <span>
                Invitation for user <UiAvatar roundedCircle user={res.data.user} size={16}/>
                {" " + res.data.user.username} sent.
            </span>;
            toastSuccess(toastMsg, toastId);
        }).catch(err => toastError(err.response.data.errors[0], toastId));
    };

    return <UiModal id={"moderatorInvite"} isOpen={isOpen} onHide={onHide} title={"Invite New Moderator"}
                    applyButton={<UiLoadableButton onClick={handleSubmit} className={"mx-0"}>Invite</UiLoadableButton>}>
        <Form noValidate>
            <Form.Group className={"mt-2 mb-1"}>
                <Form.Label className={"mr-1 text-black-60"}>User Email</Form.Label>
                <Form.Control style={{minHeight: 38, resize: "none"}} rows={1} required type={"email"} placeholder={"Existing user email."} id={"inviteEmailTextarea"}/>
            </Form.Group>
        </Form>
    </UiModal>
};

export default ModeratorInviteModal;