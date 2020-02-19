import React, {useState} from 'react';
import PropTypes from "prop-types";
import LoadingSpinner from "../components/util/LoadingSpinner";
import qs from "querystringify";
import axios from "axios";
import {Redirect, useLocation} from "react-router-dom";
import ErrorView from "../views/errors/ErrorView";
import {FaTimes} from "react-icons/fa";
import Cookies from "js-cookie";

const OauthReceiver = (props) => {
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
        //todo global variable
        axios.get("https://api.feedbacky.net/service/v1/" + props.provider + "?code=" + qsData.code)
            .then(res => {
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
        return <ErrorView message="Unknown Login Error" iconMd={<FaTimes style={{fontSize: 250, color: "#8A0707"}}/>}
                          iconSm={<FaTimes style={{fontSize: 180, color: "#8A0707"}}/>}/>
    } else if (error && status === 403) {
        return <ErrorView message="Login Refused. Sign in with other service." iconMd={<FaTimes style={{fontSize: 250, color: "#8A0707"}}/>}
                          iconSm={<FaTimes style={{fontSize: 180, color: "#8A0707"}}/>}/>
    }
    if (!loaded) {
        logIn();
        return <div className="row justify-content-center mt-5 pt-5">
            <LoadingSpinner/>
        </div>
    }
    return <Redirect from={"/auth/" + props.provider} to={"/" + qs.parse(location.search).state}/>
};

OauthReceiver.propTypes = {
    provider: PropTypes.string
};

export default OauthReceiver;