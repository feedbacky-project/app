import React, {useContext} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {getSizedAvatarByUrl, toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import PageModal from "components/modal/page-modal";

const ModeratorInvitationModal = (props) => {
    const context = useContext(AppContext);

    const handleSubmit = () => {
        const userEmail = document.getElementById("inviteEmailTextarea").value;
        axios.post("/boards/" + props.data.discriminator + "/moderators", {
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
                Invitation for user <img alt="Invite" className="rounded-circle" src={getSizedAvatarByUrl(res.data.user.avatar, 16)} onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR} height={16} width={16}/>
                {" " + res.data.user.username} sent.
            </span>;
            toastSuccess(toastMsg);
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    return <PageModal id="moderatorInvite" isOpen={props.open} onHide={props.onModInvitationCreateModalClose} title="Invite New Moderator"
                      applyButton={<Button variant="" type="submit" style={{backgroundColor: context.getTheme()}} onClick={handleSubmit} className="mx-0">Invite</Button>}>
        <Form noValidate>
            <Form.Group className="mt-2 mb-1">
                <Form.Label className="mr-1 text-black-60">User Email</Form.Label>
                <Form.Control style={{minHeight: 38, resize: "none"}} rows="1" required type="email" placeholder="Existing user email." id="inviteEmailTextarea"/>
            </Form.Group>
        </Form>
    </PageModal>
};

export default ModeratorInvitationModal;