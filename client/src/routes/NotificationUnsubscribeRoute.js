import axios from "axios";
import React, {useContext, useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {UiThemeContext} from "ui";
import {popupNotification, popupWarning} from "utils/basic-utils";

const NotificationUnsubscribeRoute = () => {
    const {getTheme} = useContext(UiThemeContext);
    const {id, code} = useParams();
    const history = useHistory();
    useEffect(() => {
        unsubscribe();
        // eslint-disable-next-line
    }, []);
    const unsubscribe = () => {
        axios.delete("/users/" + id + "/unsubscribe/" + code).then(res => {
            history.push("/");
            if (res.status !== 204) {
                popupWarning("Invalid unsubscribe token");
                return;
            }
            popupNotification("Unsubscribed from future notifications", getTheme());
        }).catch(() => {
            history.push("/");
            popupWarning("Invalid unsubscribe token");
        });
    };

    return <LoadingRouteUtil/>
};

export default NotificationUnsubscribeRoute;