import React, {useState} from 'react';
import LoadingSpinner from "components/util/loading-spinner";
import qs from "querystringify";
import axios from "axios";
import {Redirect, useLocation, useParams} from "react-router-dom";
import ErrorView from "views/errors/error-view";
import {FaTimes} from "react-icons/fa";
import Cookies from "js-cookie";
import {toastError} from "../components/util/utils";

const OauthReceiver = ({onLogin}) => {
    const {provider} = useParams();
    const location = useLocation();
    const [data, setData] = useState({loaded: false, error: false, status: 0});
    const logIn = () => {
        if (data.loaded) {
            return;
        }
        const qsData = qs.parse(location.search);
        if ("error" in qsData) {
            setData({...data, error: true});
        }
        axios.get("/service/" + provider + "?code=" + qsData.code).then(res => {
            if (res.status !== 200) {
                console.log("Failed to connect " + res.error.message);
                setData({...data, loaded: true, error: true, status: res.status});
                return;
            }
            const response = res.data;
            Cookies.set("FSID", response.token, {expires: 14});
            setData({...data, loaded: true});
            onLogin(response.token);
        }).catch(err => {
            toastError(err.response.data.errors[0]);
            setData({...data, loaded: true, error: true, status: -1});
        });
    };

    if (data.error && data.status !== 403) {
        return <ErrorView message="Unknown Login Error" icon={<FaTimes className="error-icon"/>}/>
    } else if (data.error && data.status === 403) {
        return <ErrorView message="Login Refused. Sign in with other service." icon={<FaTimes className="error-icon"/>}/>
    }
    const state = qs.parse(location.search).state;
    if (!data.loaded) {
        logIn();
        return <div className="row justify-content-center vertical-center"><LoadingSpinner/></div>
    }
    return <Redirect from={"/auth/" + provider} to={"/" + state}/>
};

export default OauthReceiver;