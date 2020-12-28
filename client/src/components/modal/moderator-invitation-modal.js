import React, {useContext} from 'react';
import Form from "react-bootstrap/Form";
import axios from "axios";
import {toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import PageModal from "components/modal/page-modal";
import {PageAvatar} from "components/app/page-avatar";
import ExecutableButton from "components/app/executable-button";

const ModeratorInvitationModal = (props) => {
    const context = useContext(AppContext);

    const handleSubmit = () => {
        const userEmail = document.getElementById("inviteEmailTextarea").value;
        return axios.post("/boards/" + props.data.discriminator + "/moderators", {
            userEmail,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            props.onModInvitationCreateModalClose();
            let mod = res.data;
            mod.role = "moderator";
            props.onModInvitationSend(mod);
            const toastMsg = <span>
                Invitation for user <PageAvatar roundedCircle url={res.data.user.avatar} size={16} username={res.data.user.username}/>
                {" " + res.data.user.username} sent.
            </span>;
            toastSuccess(toastMsg);
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    return <PageModal id="moderatorInvite" isOpen={props.open} onHide={props.onModInvitationCreateModalClose} title="Invite New Moderator"
                      applyButton={<ExecutableButton variant="" style={{backgroundColor: context.getTheme()}} onClick={handleSubmit} className="mx-0">Invite</ExecutableButton>}>
        <Form noValidate>
            <Form.Group className="mt-2 mb-1">
                <Form.Label className="mr-1 text-black-60">User Email</Form.Label>
                <Form.Control style={{minHeight: 38, resize: "none"}} rows="1" required type="email" placeholder="Existing user email." id="inviteEmailTextarea"/>
            </Form.Group>
        </Form>
    </PageModal>
};

export default ModeratorInvitationModal;