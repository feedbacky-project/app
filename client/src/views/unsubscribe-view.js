import React, {useContext, useEffect} from 'react';
import LoadingSpinner from "components/util/loading-spinner";
import axios from "axios";
import {useHistory, useParams} from "react-router-dom";
import AppContext from "context/app-context";
import {toastSuccess, toastWarning} from "components/util/utils";

const UnsubscribeView = () => {
    const context = useContext(AppContext);
    const {id, code} = useParams();
    const history = useHistory();
    const unsubscribe = () => {
        axios.delete(context.apiRoute + "/users/" + id + "/unsubscribe/" + code).then(res => {
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
    }, []);
    return <div className="row justify-content-center vertical-center"><LoadingSpinner/></div>
};

export default UnsubscribeView;