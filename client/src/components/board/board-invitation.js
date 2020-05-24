import React, {useEffect} from 'react';
import {toastSuccess, toastWarning} from "components/util/utils";
import axios from "axios";
import LoadingSpinner from "components/util/loading-spinner";
import {Row} from "react-bootstrap";
import {useHistory, useParams} from "react-router-dom";

const BoardInvitation = () => {
    const history = useHistory();
    const {code} = useParams();

    useEffect(() => {
        axios.post("/invitations/" + code + "/accept", {}).then(res => {
            if (res.status !== 200) {
                history.push("/me");
                toastWarning("Failed to validate invitation.");
                return;
            }
            history.push("/b/" + res.data.discriminator);
            toastSuccess("Invitation accepted, welcome to " + res.data.name + " board.");
        }).catch(err => {
            history.push("/me");
            toastWarning(err.response.data.errors[0]);
        });
        // eslint-disable-next-line
    }, []);

    return <Row className="justify-content-center"><LoadingSpinner/></Row>
};

export default BoardInvitation;