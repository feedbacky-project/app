import React, {useContext, useEffect} from 'react';
import AppContext from "../../context/app-context";
import axios from "axios";
import {getSimpleRequestConfig, toastSuccess, toastWarning} from "../util/utils";
import {Row} from "react-bootstrap";
import LoadingSpinner from "../util/loading-spinner";
import {useHistory, useParams} from "react-router-dom";

const ModeratorInvitation = () => {
    const context = useContext(AppContext);
    const history = useHistory();
    const {code} = useParams();

    useEffect(() => {
        axios.post(context.apiRoute + "/moderatorInvitations/" + code + "/accept", {}, getSimpleRequestConfig(context.user.session)).then(res => {
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