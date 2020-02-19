import React, {useContext, useEffect} from 'react';
import AppContext from "../../context/AppContext";
import {getSimpleRequestConfig, toastSuccess, toastWarning} from "../util/Utils";
import axios from "axios";
import LoadingSpinner from "../util/LoadingSpinner";
import {Row} from "react-bootstrap";
import {useHistory, useParams} from "react-router-dom";

const BoardInvitation = () => {
    const context = useContext(AppContext);
    const history = useHistory();
    const {code} = useParams();

    useEffect(() => {
        axios.post(context.apiRoute + "/invitations/" + code + "/accept", {}, getSimpleRequestConfig(context.user.session)).then(res => {
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
    }, []);

    return <Row className="justify-content-center"><LoadingSpinner/></Row>
};

export default BoardInvitation;