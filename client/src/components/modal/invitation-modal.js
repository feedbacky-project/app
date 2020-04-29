import React, {useContext} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {getSimpleRequestConfig, toastError, toastSuccess} from "../util/utils";
import AppContext from "../../context/app-context";
import PageModal from "./page-modal";

const InvitationModal = (props) => {
    const context = useContext(AppContext);

    const handleSubmit = () => {
        const userEmail = document.getElementById("inviteEmailTextarea").value;
        axios.post(context.apiRoute + "/boards/" + props.data.discriminator + "/invitations", {
            userEmail,
        }, getSimpleRequestConfig(props.session)).then(res => {
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
                      applyButton={<Button variant="" type="submit" style={{backgroundColor: context.theme}} onClick={handleSubmit} className="btn-smaller text-white">Invite</Button>}>
        <Form noValidate>
            <Form.Group className="mt-2 mb-1">
                <Form.Label className="mr-1 text-black-60">User Email</Form.Label>
                <Form.Control style={{borderColor: context.theme + "66", maxHeight: 38, resize: "none"}} rows="1" required type="email"
                              placeholder="Existing user email." id="inviteEmailTextarea"/>
            </Form.Group>
        </Form>
    </PageModal>
};

export default InvitationModal;