import {DEFAULT_THEME} from "AppAppearance";
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
import {getCookieOrDefault} from "utils/basic-utils";
import {retry} from "utils/lazy-init";

const ProfileRoute = lazy(() => retry(() => import("routes/profile/ProfileRoute")));
const CreateBoardRoute = lazy(() => retry(() => import("routes/board/creator/CreatorBoardRoute")));
const ModeratorInvitationRoute = lazy(() => retry(() => import("routes/ModeratorInvitationRoute")));
const BoardRoute = lazy(() => retry(() => import("routes/board/BoardRoute")));
const RoadmapRoute = lazy(() => retry(() => import("routes/RoadmapRoute")));
const BoardAdminPanelRoute = lazy(() => retry(() => import("routes/board/admin/BoardAdminPanelRoute")));
const IdeaRoute = lazy(() => retry(() => import("routes/IdeaRoute")));
const LoginRoute = lazy(() => retry(() => import("routes/LoginRoute")));
const NotificationUnsubscribeRoute = lazy(() => retry(() => import("routes/NotificationUnsubscribeRoute")));
const UiTestRoute = lazy(() => retry(() => import("routes/UiTestRoute")));

toast.configure();

const CLIENT_VERSION = "1.0.0.alpha.1";
const API_ROUTE = (process.env.REACT_APP_SERVER_IP_ADDRESS || "https://app.feedbacky.net") + "/api/v1";

const App = ({appearanceSettings}) => {
    const {appearance, setAppearance, theme, setTheme, getTheme, onAppearanceToggle} = appearanceSettings;
    const [session, setSession] = useState(Cookies.get("FSID"));
    const [localPrefs, setLocalPrefs] = useState({
        ideas: {filter: getCookieOrDefault("prefs_searchFilter", ""), sort: getCookieOrDefault("prefs_searchSort", "")},
        comments: {sort: getCookieOrDefault("prefs_comments_sort", "")}
    });
    const [serviceData, setServiceData] = useState({loaded: false, data: [], error: false});
    const [userData, setUserData] = useState({loaded: false, data: [], error: false});
    useEffect(() => {
        axios.defaults.baseURL = API_ROUTE;
        axios.defaults.headers.common["Authorization"] = "Bearer " + session;
    });
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
        Cookies.remove("prefs_appearance");
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
    if (serviceData.error) {
        return <BrowserRouter><ErrorRoute Icon={FaDizzy} message={"Service Is Temporarily Unavailable"}/></BrowserRouter>
    }
    return <ComponentLoader loader={<LoadingRouteUtil/>} loaded={serviceData.loaded && userData.loaded} component={
        <AppContext.Provider value={{
            user: {
                data: userData.data,
                loggedIn: userData.loggedIn,
                session: session,
                localPreferences: localPrefs,
                darkMode: appearance.mode === "dark",
                onLogOut: onLogOut,
            },
            serviceData: serviceData.data,
            onLocalPreferencesUpdate: onLocalPreferencesUpdate,
            onAppearanceToggle: onAppearanceToggle,
            getTheme: getTheme,
            theme: theme,
            appearance: appearance,
            setAppearance: setAppearance,
            defaultTheme: DEFAULT_THEME,
            onThemeChange: (newTheme = DEFAULT_THEME) => setTheme(newTheme),
            hardResetData: hardResetData,
            clientVersion: CLIENT_VERSION
        }}>
            <Suspense fallback={<LoadingRouteUtil/>}>
                <Switch>
                    <Route exact path={"/"} component={ProfileRoute}/>
                    <Route exact path={"/admin/create"} component={CreateBoardRoute}/>
                    <Route path={"/me/:section"} component={ProfileRoute}/>
                    <Route path={"/me/"} component={ProfileRoute}/>
                    <Route path={"/moderator_invitation/:code"} component={ModeratorInvitationRoute}/>
                    <Route path={"/b/:id/roadmap"} component={RoadmapRoute}/>
                    <Route path={"/b/:id"} component={BoardRoute}/>
                    <Route path={"/ba/:id"} component={BoardAdminPanelRoute}/>
                    <Route path={"/i/:id"} component={IdeaRoute}/>
                    <Route path={"/unsubscribe/:id/:code"} component={NotificationUnsubscribeRoute}/>
                    <Route path={"/auth/:provider"} render={() => <LoginRoute onLogin={onLogin}/>}/>
                    <Route path={"/-/ui-test"} component={UiTestRoute}/>
                    <Route render={() => <ErrorRoute Icon={FaExclamationCircle} message={"Content Not Found"}/>}/>
                </Switch>
            </Suspense>
        </AppContext.Provider>
    }/>
};

export default App;
