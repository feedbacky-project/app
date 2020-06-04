import React, {lazy, Suspense, useEffect, useState} from 'react';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
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

const ProfileView = lazy(() => retry(() => import("views/profile/profile-view")));
const CreateBoardView = lazy(() => retry(() => import("views/creator/create-board-view")));
const ModeratorInvitation = lazy(() => retry(() => import("components/board/moderator-invitation")));
const BoardInvitation = lazy(() => retry(() => import("components/board/board-invitation")));
const BoardView = lazy(() => retry(() => import("views/board-view")));
const RoadmapView = lazy(() => retry(() => import("views/roadmap-view")));
const AdminPanelView = lazy(() => retry(() => import("views/admin/admin-panel-view")));
const IdeaView = lazy(() => retry(() => import("views/idea-view")));
const OauthReceiver = lazy(() => retry(() => import("auth/oauth-receiver")));
const UnsubscribeView = lazy(() => retry(() => import("views/unsubscribe-view")));

toast.configure();

const CLIENT_VERSION = "0.2.0-beta";
const API_ROUTE = (process.env.REACT_APP_SERVER_IP_ADDRESS || "https://app.feedbacky.net") + "/api/v1";

const App = () => {
    const [session, setSession] = useState(Cookies.get("FSID"));
    const [searchPrefs, setSearchPrefs] = useState({filter: localStorage.getItem("searchFilter"), sort: localStorage.getItem("searchSort")});
    const [serviceData, setServiceData] = useState({loaded: false, data: [], error: false});
    const [userData, setUserData] = useState({loaded: false, data: [], error: false});
    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === 'true');
    const [theme, setTheme] = useState("#343a40");

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else if (localStorage.getItem("darkMode") == null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
            document.body.classList.add("dark");
            localStorage.setItem("darkMode", "true");
        }
        if (userData.loaded && serviceData.loaded) {
            return;
        }
        axios.defaults.baseURL = API_ROUTE;
        axios.defaults.headers.common["Authorization"] = "Bearer " + session;
        if (!serviceData.loaded) {
            axios.get("/service/about").then(res => {
                console.log("Service link established, running client version " + CLIENT_VERSION);
                setServiceData({...serviceData, loaded: true, loading: false, data: res.data});
            }).catch(() => setServiceData({...serviceData, loading: false, error: true}));
        }
        if (session == null) {
            setUserData({...userData, loaded: true});
            return;
        }
        if (!userData.loaded) {
            axios.get("/users/@me").then(res => {
                setUserData({...userData, data: res.data, loaded: true, loggedIn: true, loading: false});
            }).catch(err => {
                if (err.response === undefined || err.response.status === 401 || err.response.status === 403 || (err.response.status >= 500 && err.response.status <= 599)) {
                    setUserData({...userData, loaded: true, loggedIn: false, loading: false});
                    return;
                }
                setUserData({...userData, loaded: true, loggedIn: false, loading: false, error: true});
            });
        }
    }, [serviceData, userData]);
    const onLogin = (token) => {
        setSession(token);
        //force rerender
        setUserData({...userData, loaded: false});
        setServiceData({...serviceData, loaded: false});
    };
    const onLogOut = () => {
        Cookies.remove("FSID");
        setSession(null);
        setUserData({...userData, data: [], loaded: true, loggedIn: false});
    };
    const onFilteringUpdate = (filter, boardData, history) => {
        localStorage.setItem("searchFilter", filter);
        setSearchPrefs({...searchPrefs, filter});
        boardRedirect(history, boardData);
    };
    const onSortingUpdate = (sort, boardData, history) => {
        localStorage.setItem("searchSort", sort);
        setSearchPrefs({...searchPrefs, sort});
        boardRedirect(history, boardData);
    };
    const boardRedirect = (history, boardData) => {
        history.push({
            pathname: "/brdr/" + boardData.discriminator,
            state: {_boardData: boardData},
        });
    };
    const getTheme = () => {
        let color = tinycolor(theme);
        if (darkMode) {
            color = color.lighten(10);
            //if still not readable, increase again
            if (tinycolor.readability(color, "#282828") < 2.5) {
                color = color.lighten(25);
            }
        }
        return color;
    };
    const onDarkModeToggle = () => {
        let darkModeEnabled = (localStorage.getItem("darkMode") === 'true');
        localStorage.setItem("darkMode", (!darkModeEnabled).toString());
        setDarkMode(darkModeEnabled);
        if (darkModeEnabled) {
            document.body.classList.remove("dark");
        } else {
            document.body.classList.add("dark");
        }
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
                searchPreferences: searchPrefs,
                darkMode: darkMode,
                onLogOut: onLogOut,
            },
            serviceData: serviceData.data,
            onFilteringUpdate: onFilteringUpdate,
            onSortingUpdate: onSortingUpdate,
            onDarkModeToggle: onDarkModeToggle,
            getTheme: getTheme,
            theme: theme,
            onThemeChange: theme => setTheme(theme),
        }}>
            <Suspense fallback={<Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>}>
                <Switch>
                    <Route exact path="/" component={ProfileView}/>
                    <Route exact path="/admin/create" component={CreateBoardView}/>
                    <Route path="/merdr/:section" render={(props) =>
                        <Redirect to={{
                            pathname: "/me/" + props.match.params.section,
                            state: props.location.state,
                        }}/>}/>
                    <Route path="/me/:section" component={ProfileView}/>
                    <Route path="/me/" component={ProfileView}/>
                    <Route path="/moderator_invitation/:code" component={ModeratorInvitation}/>
                    <Route path="/invitation/:code" component={BoardInvitation}/>
                    <Route path={"/b/:id/roadmap"} component={RoadmapView}/>
                    <Route path="/b/:id" component={BoardView}/>
                    {/* sneaky way to redirect from /b/ to /b/ but with different :id parameters, because it doesn't work */}
                    <Route path="/brdr/:id" render={props =>
                        <Redirect to={{
                            pathname: "/b/" + props.match.params.id,
                            state: props.location.state,
                        }}/>}/>
                    <Route path="/ba/:id" component={AdminPanelView}/>
                    <Route path="/bardr/:id/:section" render={props =>
                        <Redirect to={{
                            pathname: "/ba/" + props.match.params.id + "/" + props.match.params.section,
                            state: props.location.state,
                        }}/>}/>
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
