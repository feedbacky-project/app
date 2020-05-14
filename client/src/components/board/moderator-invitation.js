import React, {useEffect} from 'react';
import axios from "axios";
import {toastSuccess, toastWarning} from "components/util/utils";
import {Row} from "react-bootstrap";
import LoadingSpinner from "components/util/loading-spinner";
import {useHistory, useParams} from "react-router-dom";

const ModeratorInvitation = () => {
    const history = useHistory();
    const {code} = useParams();

    useEffect(() => {
        axios.post("/moderatorInvitations/" + code + "/accept", {}).then(res => {
            if (res.status !== 200) {
                history.push("/me");
                toastWarning("Failed to validate invitation.");
                return;
            }
            history.push("/b/" + res.data.discriminator);
            toastSuccess("Invitation accepted, welcome to " + res.data.name + " board moderator.");
        }).catch(err => {
            history.push("/me");
            toastWarning(err.response.data.errors[0]);
        });
    }, []);

    return <Row className="justify-content-center"><LoadingSpinner/></Row>
};

export default ModeratorInvitation;