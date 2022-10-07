import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {DARK_THEME_COLOR, LIGHT_THEME_COLOR} from "AppAppearance";
import axios from "axios";
import HotkeysModal from "components/commons/modal/HotkeysModal";
import ComponentLoader from "components/ComponentLoader";
import {AppContext} from "context";
import Cookies from "js-cookie";
import React, {lazy, Suspense, useEffect, useState} from 'react';
import {FaDizzy, FaExclamationCircle} from "react-icons/fa";
import {BrowserRouter, Route, Switch, useHistory, useLocation} from "react-router-dom";

import ErrorRoute from "routes/ErrorRoute";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {UiThemeContext} from "ui";
import {getCookieOrDefault, hideNotifications, popupError, popupWarning} from "utils/basic-utils";
import {getEnvVar} from "utils/env-vars";
import {retry} from "utils/lazy-init";

const ConditionalReroute = lazy(() => retry(() => import("routes/ConditionalReroute")));
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

export const CLIENT_VERSION = "1.0.0.RC.5";
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
        ideas: {filter: "status:OPENED", sort: "trending"},
        comments: {sort: "newest"}, changelog: {sort: "newest"}
    });
    const [serviceData, setServiceData] = useState({loaded: false, data: [], error: false});
    const [userData, setUserData] = useState({loaded: false, data: [], error: false});
    const [loginIntent, setLoginIntent] = useState(getCookieOrDefault("intents", ""));
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
            if (res.data.developmentMode) {
                popupWarning("Development mode active.");
            }
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

                //we check for log-in intents after successful login
                const intent = Cookies.get("intents");
                if (intent) {
                    setLoginIntent(intent);
                    Cookies.remove("intents");
                }
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
    const onThemeChange = (newTheme) => {
        let changedTheme = newTheme;
        if (changedTheme == null) {
            changedTheme = (appearance.mode === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
        }
        setTheme(changedTheme);
        let metaThemeColor = document.querySelector("meta[name=theme-color]");
        metaThemeColor.setAttribute("content", changedTheme);
    };
    const onIntentComplete = () => {
        setLoginIntent(null);
        Cookies.remove("intents");
    };
    const setIntent = (data) => {
        //we set this cookie as a temporary session cookie
        Cookies.set("intents", data);
    };
    if (serviceData.error) {
        const onBack = () => window.location.reload();
        return <BrowserRouter><ErrorRoute Icon={FaDizzy} message={"Service Is Temporarily Unavailable"} onBackButtonClick={onBack}/></BrowserRouter>
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
            loginIntent, setIntent, onIntentComplete,
            serviceData: serviceData.data,
            onLocalPreferencesUpdate: setLocalPrefs,
            onAppearanceToggle: onAppearanceToggle,
            appearance: appearance,
            setAppearance: setAppearance,
            hardResetData: hardResetData,
        }}>
            <UiThemeContext.Provider value={{
                darkMode: appearance.mode === "dark",
                getTheme: getTheme,
                theme: theme,
                defaultTheme: appearance.mode === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
                onThemeChange: onThemeChange,
            }}>
                <HotkeysModal/>
                <Suspense fallback={<LoadingRouteUtil/>}>
                    <Switch>
                        <Route exact path={"/"} component={ConditionalReroute}/>
                        <Route exact path={"/create"} component={CreateBoardRoute}/>
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
            </UiThemeContext.Provider>
        </AppContext.Provider>
    }/>
};

export default App;
