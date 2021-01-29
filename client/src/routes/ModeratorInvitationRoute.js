import axios from "axios";
import React, {useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {toastSuccess, toastWarning} from "utils/basic-utils";

const ModeratorInvitationRoute = () => {
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
        // eslint-disable-next-line
    }, []);

    return <LoadingRouteUtil/>
};

export default ModeratorInvitationRoute;