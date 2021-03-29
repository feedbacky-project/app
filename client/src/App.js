import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {DARK_THEME_COLOR, LIGHT_THEME_COLOR} from "AppAppearance";
import axios from "axios";
import ComponentLoader from "components/ComponentLoader";
import AppContext from "context/AppContext";
import Cookies from "js-cookie";
import React, {lazy, Suspense, useEffect, useState} from 'react';
import {FaDizzy, FaExclamationCircle} from "react-icons/fa";
import {BrowserRouter, Route, Switch, useHistory, useLocation} from "react-router-dom";

import ErrorRoute from "routes/ErrorRoute";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {hideNotifications, popupError, popupWarning} from "utils/basic-utils";
import {getEnvVar} from "utils/env-vars";
import {retry} from "utils/lazy-init";

const ProfileRoute = lazy(() => retry(() => import("routes/profile/ProfileRoute")));
const CreateBoardRoute = lazy(() => retry(() => import("routes/board/creator/CreatorBoardRoute")));
const ModeratorInvitationRoute = lazy(() => retry(() => import("routes/ModeratorInvitationRoute")));
const BoardRoute = lazy(() => retry(() => import("routes/board/BoardRoute")));
const RoadmapRoute = lazy(() => retry(() => import("routes/RoadmapRoute")));
const ChangelogRoute = lazy(() => retry(() => import("routes/ChangelogRoute")));
const BoardAdminPanelRoute = lazy(() => retry(() => import("routes/board/admin/BoardAdminPanelRoute")));
const IdeaRoute = lazy(() => retry(() => import("routes/IdeaRoute")));
const LoginRoute = lazy(() => retry(() => import("routes/LoginRoute")));
const NotificationUnsubscribeRoute = lazy(() => retry(() => import("routes/NotificationUnsubscribeRoute")));
const UiTestRoute = lazy(() => retry(() => import("routes/UiTestRoute")));

export const CLIENT_VERSION = "1.0.0.alpha.5";
export const API_ROUTE = getEnvVar("REACT_APP_SERVER_IP_ADDRESS", "https://app.feedbacky.net") + "/api/v1";
// Minimum Web Content Accessibility Guidelines contrast ratio for text
export const WCAG_AA_CONTRAST = 3.0;

axios.interceptors.response.use(undefined, error => {
    if (error.response === undefined) {
        popupError("API server unreachable. Please contact administrator.");
        return Promise.reject(error);
    }
    if (error.response.status === 500) {
        popupError("Internal Server Error. Please contact administrator.");
    }
    if (error.response.data.errors !== undefined) {
        error.response.data.errors.forEach(err => popupWarning(err));
    }
    return Promise.reject(error);
});

const App = ({appearanceSettings}) => {
    const {appearance, setAppearance, theme, setTheme, getTheme, onAppearanceToggle} = appearanceSettings;
    const [session, setSession] = useState(Cookies.get("FSID"));
    const [localPrefs, setLocalPrefs] = useState({
        ideas: {filter: "opened", sort: "trending"},
        comments: {sort: "newest"}
    });
    const [serviceData, setServiceData] = useState({loaded: false, data: [], error: false});
    const [userData, setUserData] = useState({loaded: false, data: [], error: false});
    const history = useHistory();
    const location = useLocation();
    const startAnonymousSession = () => {
        new FingerprintJS.load().then(fp => fp.get().then(res => {
            console.info("Anonymous session started. User identificator: " + res.visitorId);
            axios.defaults.headers.common["X-Feedbacky-Anonymous-Id"] = res.visitorId;
        }));
    };
    useEffect(() => {
        axios.defaults.baseURL = API_ROUTE;
        axios.defaults.headers.common["Authorization"] = "Bearer " + session;
        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        if (serviceData.loaded) {
            return;
        }
        axios.get("/service/about").then(res => {
            console.info("Service link established, running client version " + CLIENT_VERSION + ", server version " + res.data.serverVersion);
            setServiceData({...serviceData, loaded: true, data: res.data});
        }).catch(() => setServiceData({...serviceData, loaded: true, error: true}));
    }, [serviceData]);
    useEffect(() => {
        if (userData.loaded) {
            return;
        }
        if (session == null && !userData.loaded) {
            startAnonymousSession();
            setUserData({...userData, loaded: true, loggedIn: false});
            return;
        }
        if (!userData.loaded) {
            axios.get("/users/@me").then(res => {
                setUserData({...userData, data: res.data, loaded: true, loggedIn: true});
            }).catch(err => {
                hideNotifications();
                if (err.response === undefined || err.response.status === 401 || err.response.status === 403 || (err.response.status >= 500 && err.response.status <= 599)) {
                    startAnonymousSession();
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
        startAnonymousSession();
        delete axios.defaults.headers.common["Authorization"];
        Cookies.remove("FSID");
        setSession(null);
        history.push({pathname: location.pathname, state: null});
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
        return <BrowserRouter><ErrorRoute Icon={FaDizzy} message={"Service Is Temporarily Unavailable"} onBackButtonClick={() => window.location.reload()}/></BrowserRouter>
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
            defaultTheme: appearance.mode === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
            onThemeChange: (newTheme = (appearance.mode === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR)) => setTheme(newTheme),
            hardResetData: hardResetData,
        }}>
            <Suspense fallback={<LoadingRouteUtil/>}>
                <Switch>
                    <Route exact path={"/"} component={ProfileRoute}/>
                    <Route exact path={"/admin/create"} component={CreateBoardRoute}/>
                    <Route path={"/me/:section"} component={ProfileRoute}/>
                    <Route path={"/me/"} component={ProfileRoute}/>
                    <Route path={"/moderator_invitation/:code"} component={ModeratorInvitationRoute}/>
                    <Route path={"/b/:id/roadmap"} component={RoadmapRoute}/>
                    <Route path={"/b/:id/changelog"} component={ChangelogRoute}/>
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
