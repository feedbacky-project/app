import axios from "axios";
import AppContext from "context/AppContext";
import React, {useContext, useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {popupNotification, popupWarning} from "utils/basic-utils";

const NotificationUnsubscribeRoute = () => {
    const {getTheme} = useContext(AppContext);
    const {id, code} = useParams();
    const history = useHistory();
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
    useEffect(() => {
        unsubscribe();
        // eslint-disable-next-line
    }, []);
    return <LoadingRouteUtil/>
};

export default NotificationUnsubscribeRoute;