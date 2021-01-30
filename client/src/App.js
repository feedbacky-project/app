import axios from "axios";
import ComponentLoader from "components/ComponentLoader";
import AppContext from "context/AppContext";
import Cookies from "js-cookie";
import React, {lazy, Suspense, useEffect, useState} from 'react';
import {FaDizzy, FaExclamationCircle} from "react-icons/fa";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {toast} from "react-toastify";

import ErrorRoute from "routes/ErrorRoute";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import tinycolor from "tinycolor2";
import {getCookieOrDefault} from "utils/basic-utils";
import {retry} from "utils/lazy-init";

const ProfileView = lazy(() => retry(() => import("routes/profile/ProfileRoute")));
const CreateBoardView = lazy(() => retry(() => import("routes/board/creator/CreatorBoardRoute")));
const ModeratorInvitation = lazy(() => retry(() => import("routes/ModeratorInvitationRoute")));
const BoardView = lazy(() => retry(() => import("routes/board/BoardRoute")));
const RoadmapView = lazy(() => retry(() => import("routes/RoadmapRoute")));
const AdminPanelView = lazy(() => retry(() => import("routes/board/admin/BoardAdminPanelRoute")));
const IdeaView = lazy(() => retry(() => import("routes/IdeaRoute")));
const OauthReceiver = lazy(() => retry(() => import("routes/LoginRoute")));
const UnsubscribeView = lazy(() => retry(() => import("routes/NotificationUnsubscribeRoute")));
const UiTestRoute = lazy(() => retry(() => import("routes/UiTestRoute")));

toast.configure();

const CLIENT_VERSION = "1.0.0-alpha";
const API_ROUTE = (process.env.REACT_APP_SERVER_IP_ADDRESS || "https://app.feedbacky.net") + "/api/v1";
const DEFAULT_THEME = "#343a40";

const App = () => {
    const [session, setSession] = useState(Cookies.get("FSID"));
    const [localPrefs, setLocalPrefs] = useState({
        ideas: {filter: getCookieOrDefault("prefs_searchFilter", ""), sort: getCookieOrDefault("prefs_searchSort", "")},
        comments: {sort: getCookieOrDefault("prefs_comments_sort", "")}
    });
    const [serviceData, setServiceData] = useState({loaded: false, data: [], error: false});
    const [userData, setUserData] = useState({loaded: false, data: [], error: false});
    const [darkMode, setDarkMode] = useState(getCookieOrDefault("prefs_darkMode", "false") === 'true');
    const [theme, setTheme] = useState(DEFAULT_THEME);

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
        return color.clone();
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
        return <BrowserRouter><ErrorRoute Icon={FaDizzy} message={"Service Is Temporarily Unavailable"}/></BrowserRouter>
    }
    return <ComponentLoader loader={<LoadingRouteUtil/>}
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
            defaultTheme: DEFAULT_THEME,
            onThemeChange: (newTheme = DEFAULT_THEME) => setTheme(newTheme),
            clientVersion: CLIENT_VERSION
        }}>
            <Suspense fallback={<LoadingRouteUtil/>}>
                <Switch>
                    <Route exact path={"/"} component={ProfileView}/>
                    <Route exact path={"/admin/create"} component={CreateBoardView}/>
                    <Route path={"/me/:section"} component={ProfileView}/>
                    <Route path={"/me/"} component={ProfileView}/>
                    <Route path={"/moderator_invitation/:code"} component={ModeratorInvitation}/>
                    <Route path={"/b/:id/roadmap"} component={RoadmapView}/>
                    <Route path={"/b/:id"} component={BoardView}/>
                    <Route path={"/ba/:id"} component={AdminPanelView}/>
                    <Route path={"/i/:id"} component={IdeaView}/>
                    <Route path={"/unsubscribe/:id/:code"} component={UnsubscribeView}/>
                    <Route path={"/auth/:provider"} render={() => <OauthReceiver onLogin={onLogin}/>}/>
                    <Route path={"/-/ui-test"} component={UiTestRoute}/>
                    <Route render={() => <ErrorRoute Icon={FaExclamationCircle} message={"Content Not Found"}/>}/>
                </Switch>
            </Suspense>
        </AppContext.Provider>
    }/>
};

export default App;
