import axios from "axios";
import Cookies from "js-cookie";
import qs from "querystringify";
import React, {useState} from 'react';
import {FaTimes} from "react-icons/fa";
import {Redirect, useLocation, useParams} from "react-router-dom";
import ErrorRoute from "routes/ErrorRoute";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {useTitle} from "utils/use-title";

const LoginRoute = ({onLogin}) => {
    const {provider} = useParams();
    const location = useLocation();
    const [data, setData] = useState({loaded: false, error: false, status: 0});
    useTitle("Logging in...");
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
                console.warn("Failed to connect " + res.error.message);
                setData({...data, loaded: true, error: true, status: res.status});
                return;
            }
            const response = res.data;
            Cookies.set("FSID", response.token, {expires: 14});
            setData({...data, loaded: true});
            onLogin(response.token);
        }).catch(() => setData({...data, loaded: true, error: true, status: -1}));
    };

    if (data.error && data.status !== 403) {
        return <ErrorRoute message={"Unknown Login Error"} Icon={FaTimes}/>
    } else if (data.error && data.status === 403) {
        return <ErrorRoute message={"Login Refused. Sign in with other service."} Icon={FaTimes}/>
    }
    const state = qs.parse(location.search).state;
    if (!data.loaded) {
        logIn();
        return <LoadingRouteUtil/>
    }
    return <Redirect from={"/auth/" + provider} to={"/" + state}/>
};

export default LoginRoute;