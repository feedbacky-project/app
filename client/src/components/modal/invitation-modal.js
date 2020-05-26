import React, {useContext} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import PageModal from "components/modal/page-modal";

const InvitationModal = (props) => {
    const context = useContext(AppContext);

    const handleSubmit = () => {
        const userEmail = document.getElementById("inviteEmailTextarea").value;
        axios.post("/boards/" + props.data.discriminator + "/invitations", {
            userEmail,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            props.onInvitationCreateModalClose();
            props.onInvitationSend(res.data);
            toastSuccess("Invitation for user " + res.data.user.username + " sent.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    return <PageModal id="invitation" isOpen={props.open} onHide={props.onInvitationCreateModalClose} title={"Invite New User"}
                      applyButton={<Button variant="" type="submit" style={{backgroundColor: context.getTheme()}} onClick={handleSubmit} className="mx-0">Invite</Button>}>
        <Form noValidate>
            <Form.Group className="mt-2 mb-1">
                <Form.Label className="mr-1 text-black-60">User Email</Form.Label>
                <Form.Control style={{borderColor: context.getTheme() + "66", minHeight: 38, resize: "none"}} rows="1" required type="email"
                              placeholder="Existing user email." id="inviteEmailTextarea"/>
            </Form.Group>
        </Form>
    </PageModal>
};

export default InvitationModal;