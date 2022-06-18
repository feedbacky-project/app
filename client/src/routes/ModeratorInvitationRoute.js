import axios from "axios";
import React, {useContext, useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {UiThemeContext} from "ui";
import {popupNotification, popupWarning} from "utils/basic-utils";

const ModeratorInvitationRoute = () => {
    const {getTheme} = useContext(UiThemeContext);
    const history = useHistory();
    const {code} = useParams();
    useEffect(() => {
        axios.post("/moderatorInvitations/" + code + "/accept", {}).then(res => {
            if (res.status !== 200) {
                history.push("/me");
                popupWarning("Failed to validate invitation");
                return;
            }
            history.push("/b/" + res.data.discriminator);
            popupNotification("Invitation accepted, you're a moderator now", getTheme());
        }).catch(() => history.push("/me"));
        // eslint-disable-next-line
    }, []);

    return <LoadingRouteUtil/>
};

export default ModeratorInvitationRoute;