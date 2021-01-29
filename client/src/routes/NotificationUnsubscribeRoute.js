import axios from "axios";
import React, {useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {toastSuccess, toastWarning} from "utils/basic-utils";

const NotificationUnsubscribeRoute = () => {
    const {id, code} = useParams();
    const history = useHistory();
    const unsubscribe = () => {
        axios.delete("/users/" + id + "/unsubscribe/" + code).then(res => {
            history.push("/");
            if (res.status !== 204) {
                toastWarning("Failed to unsubscribe, probably invalid unsubscribe token.");
                return;
            }
            toastSuccess("Successfully unsubscribed from future notifications.");
        }).catch(() => {
            history.push("/");
            toastWarning("Failed to unsubscribe, probably invalid unsubscribe token.");
        });
    };
    useEffect(() => {
        unsubscribe();
        // eslint-disable-next-line
    }, []);
    return <LoadingRouteUtil/>
};

export default NotificationUnsubscribeRoute;