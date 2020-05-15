import React, {useContext, useState} from 'react';
import LoadingSpinner from "components/util/loading-spinner";
import qs from "querystringify";
import axios from "axios";
import {Redirect, useLocation, useParams} from "react-router-dom";
import ErrorView from "views/errors/error-view";
import {FaTimes} from "react-icons/fa";
import Cookies from "js-cookie";
import AppContext from "context/app-context";

const OauthReceiver = (props) => {
    const context = useContext(AppContext);
    const {provider} = useParams();
    const location = useLocation();
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [status, setStatus] = useState(0);
    const logIn = () => {
        if (loaded) {
            return;
        }
        const qsData = qs.parse(location.search);
        if ("error" in qsData) {
            setError(true);
        }
        axios.get(context.apiRoute + "/service/" + provider + "?code=" + qsData.code).then(res => {
            if (res.status !== 200) {
                console.log("Failed to connect " + res.error.message);
                setLoaded(true);
                setError(true);
                setStatus(res.status);
                return;
            }
            const data = res.data;
            Cookies.set("FSID", data.token, {expires: 14});
            setLoaded(true);
            props.onLogin(data.token);
        }).catch(() => {
            setLoaded(true);
            setError(true);
            setStatus(-1);
        });
    };

    if (error && status !== 403) {
        return <ErrorView message="Unknown Login Error" icon={<FaTimes className="error-icon"/>}/>
    } else if (error && status === 403) {
        return <ErrorView message="Login Refused. Sign in with other service." icon={<FaTimes className="error-icon"/>}/>
    }
    if (!loaded) {
        logIn();
        return <div className="row justify-content-center vertical-center"><LoadingSpinner/></div>
    }
    return <Redirect from={"/auth/" + provider} to={"/" + qs.parse(location.search).state}/>
};

export default OauthReceiver;