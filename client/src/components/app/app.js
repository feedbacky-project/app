import React, {lazy, Suspense, useEffect, useState} from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import Cookies from "js-cookie";
import tinycolor from "tinycolor2";

import ErrorView from "views/errors/error-view";
import AppContext from "context/app-context";
import LoadingSpinner from "components/util/loading-spinner";
import {FaDizzy, FaExclamationCircle} from "react-icons/fa";
import {Row} from "react-bootstrap";
import {retry} from "components/util/lazy-init";
import ComponentLoader from "components/app/component-loader";
import {getCookieOrDefault} from "components/util/utils";

const ProfileView = lazy(() => retry(() => import("views/profile/profile-view")));
const CreateBoardView = lazy(() => retry(() => import("views/creator/create-board-view")));
const ModeratorInvitation = lazy(() => retry(() => import("components/board/moderator-invitation")));
const BoardView = lazy(() => retry(() => import("views/board-view")));
const RoadmapView = lazy(() => retry(() => import("views/roadmap-view")));
const AdminPanelView = lazy(() => retry(() => import("views/admin/admin-panel-view")));
const IdeaView = lazy(() => retry(() => import("views/idea-view")));
const OauthReceiver = lazy(() => retry(() => import("auth/oauth-receiver")));
const UnsubscribeView = lazy(() => retry(() => import("views/unsubscribe-view")));

toast.configure();

const CLIENT_VERSION = "0.5.0-beta";
const API_ROUTE = (process.env.REACT_APP_SERVER_IP_ADDRESS || "https://app.feedbacky.net") + "/api/v1";

const App = () => {
    const [session, setSession] = useState(Cookies.get("FSID"));
    const [localPrefs, setLocalPrefs] = useState({
        ideas: {filter: getCookieOrDefault("prefs_searchFilter", ""), sort: getCookieOrDefault("prefs_searchSort", "")},
        comments: {sort: getCookieOrDefault("prefs_comments_sort", "")}
    });
    const [serviceData, setServiceData] = useState({loaded: false, data: [], error: false});
    const [userData, setUserData] = useState({loaded: false, data: [], error: false});
    const [darkMode, setDarkMode] = useState(getCookieOrDefault("prefs_darkMode", "false") === 'true');
    const [theme, setTheme] = useState("#343a40");

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else if (getCookieOrDefault("prefs_darkMode", null) == null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
            document.body.classList.add("dark");
            Cookies.set("prefs_darkMode", "true", {expires: 10 * 365 * 7 /* 10 years */});
        }
        axios.defaults.baseURL = API_ROUTE;
        axios.defaults.headers.common["Authorization"] = "Bearer " + session;
        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        if (serviceData.loaded) {
            return;
        }
        axios.get("/service/about").then(res => {
            console.log("Service link established, running client version " + CLIENT_VERSION + ", server version " + res.data.serverVersion);
            setServiceData({...serviceData, loaded: true, data: res.data});
        }).catch(() => setServiceData({...serviceData, loaded: true, error: true}));
    }, [serviceData]);
    useEffect(() => {
        if (userData.loaded) {
            return;
        }
        if (session == null && !userData.loaded) {
            setUserData({...userData, loaded: true, loggedIn: false});
            return;
        }
        if (!userData.loaded) {
            axios.get("/users/@me").then(res => {
                setUserData({...userData, data: res.data, loaded: true, loggedIn: true});
            }).catch(err => {
                if (err.response === undefined || err.response.status === 401 || err.response.status === 403 || (err.response.status >= 500 && err.response.status <= 599)) {
                    setUserData({...userData, loaded: true, loggedIn: false});
                    return;
                }
                setUserData({...userData, loaded: true, loggedIn: false, error: true});
            });
        }
        // eslint-disable-next-line
    }, [userData]);
    const hardResetData = () => {
        Cookies.remove("prefs_searchFilter");
        Cookies.remove("prefs_searchSort");
        Cookies.remove("prefs_comments_sort");
        Cookies.remove("prefs_darkMode");
        onLogOut();
        setServiceData({...serviceData, data: [], loaded: false, error: false});
    };
    const onLogin = (token) => {
        setSession(token);
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        //force rerender
        setUserData({...userData, loaded: false});
    };
    const onLogOut = () => {
        Cookies.remove("FSID");
        setSession(null);
        setUserData({...userData, data: [], loaded: true, loggedIn: false});
    };
    const onLocalPreferencesUpdate = (data) => {
        if (data.ideas.filter != null) {
            Cookies.set("prefs_searchFilter", data.ideas.filter, {expires: 10 * 365 * 7 /* 10 years */});
        }
        if (data.ideas.sort != null) {
            Cookies.set("prefs_searchSort", data.ideas.sort, {expires: 10 * 365 * 7 /* 10 years */});
        }
        if (data.comments.sort != null) {
            Cookies.set("prefs_comments_sort", data.comments.sort, {expires: 10 * 365 * 7 /* 10 years */});
        }
        setLocalPrefs(data);
    };
    const getTheme = (adjustColor = true) => {
        let color = tinycolor(theme);
        if (darkMode && adjustColor) {
            color = color.lighten(10);
            //if still not readable, increase again
            if (tinycolor.readability(color, "#282828") < 2.5) {
                color = color.lighten(25);
            }
        }
        return color;
    };
    const onDarkModeToggle = () => {
        let darkModeEnabled = (getCookieOrDefault("prefs_darkMode", "false") === 'true');
        Cookies.set("prefs_darkMode", (!darkModeEnabled).toString(), {expires: 10 * 365 * 7 /* 10 years */});
        if (darkMode) {
            document.body.classList.remove("dark");
        } else {
            document.body.classList.add("dark");
        }
        setDarkMode(!darkMode);
    };
    if (serviceData.error) {
        return <BrowserRouter><ErrorView icon={<FaDizzy className="error-icon"/>} message="Service Is Temporarily Unavailable"/></BrowserRouter>
    }
    return <ComponentLoader loader={<Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>}
                            loaded={serviceData.loaded && userData.loaded} component={
        <AppContext.Provider value={{
            user: {
                data: userData.data,
                loggedIn: userData.loggedIn,
                session: session,
                localPreferences: localPrefs,
                darkMode: darkMode,
                onLogOut: onLogOut,
                hardResetData: hardResetData,
            },
            serviceData: serviceData.data,
            onLocalPreferencesUpdate: onLocalPreferencesUpdate,
            onDarkModeToggle: onDarkModeToggle,
            getTheme: getTheme,
            theme: theme,
            onThemeChange: newTheme => setTheme(newTheme),
            clientVersion: CLIENT_VERSION
        }}>
            <Suspense fallback={<Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>}>
                <Switch>
                    <Route exact path="/" component={ProfileView}/>
                    <Route exact path="/admin/create" component={CreateBoardView}/>
                    <Route path="/me/:section" component={ProfileView}/>
                    <Route path="/me/" component={ProfileView}/>
                    <Route path="/moderator_invitation/:code" component={ModeratorInvitation}/>
                    <Route path="/b/:id/roadmap" component={RoadmapView}/>
                    <Route path="/b/:id" component={BoardView}/>
                    <Route path="/ba/:id" component={AdminPanelView}/>
                    <Route path="/i/:id" component={IdeaView}/>
                    <Route path="/unsubscribe/:id/:code" component={UnsubscribeView}/>
                    <Route path="/auth/:provider" render={() => <OauthReceiver onLogin={onLogin}/>}/>
                    <Route render={() => <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>}/>
                </Switch>
            </Suspense>
        </AppContext.Provider>
    }/>
};

export default App;
