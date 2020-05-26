import React, {Component, lazy, Suspense} from 'react';
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
const AdminPanelView = lazy(() => retry(() => import("views/admin/admin-panel-view")));
const IdeaView = lazy(() => retry(() => import("views/idea-view")));
const OauthReceiver = lazy(() => retry(() => import("auth/oauth-receiver")));
const UnsubscribeView = lazy(() => retry(() => import("views/unsubscribe-view")));

toast.configure();

class App extends Component {

    CLIENT_VERSION = "0.2.0-beta";
    API_ROUTE = (process.env.REACT_APP_SERVER_IP_ADDRESS || "https://app.feedbacky.net") + "/api/v1";
    state = {
        session: Cookies.get("FSID"),
        search: {
            filter: localStorage.getItem("searchFilter"),
            sort: localStorage.getItem("searchSort"),
        },
        serviceData: {loaded: false, data: [], error: false},
        userData: {loaded: false, data: [], error: false, loggedIn: false},
        darkMode: (localStorage.getItem("darkMode") === 'true'),
        theme: "#343a40",
    };

    componentDidMount() {
        if (this.state.darkMode) {
            document.body.classList.add("dark");
        } else if (localStorage.getItem("darkMode") == null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setState({darkMode: true});
            document.body.classList.add("dark");
            localStorage.setItem("darkMode", "true");
        }
        if (this.state.userData.loaded && this.state.serviceData.loaded) {
            return;
        }
        axios.defaults.baseURL = this.API_ROUTE;
        axios.defaults.headers.common["Authorization"] = "Bearer " + this.state.session;
        if (!this.state.serviceData.loaded) {
            axios.get("/service/about").then(res => {
                this.setState({
                    serviceData: {...this.state.serviceData, loaded: true, data: res.data}
                });
            }).catch(() => this.setState({
                serviceData: {...this.state.serviceData, error: true}
            }));
        }
        if (this.state.session == null) {
            this.setState({
                userData: {...this.state.userData, loaded: true}
            });
            return;
        }
        axios.get("/users/@me").then(res => {
            this.setState({
                userData: {...this.state.userData, data: res.data, loaded: true, loggedIn: true}
            });
        }).catch(err => {
            if (err.response === undefined || err.response.status === 401 || err.response.status === 403 || (err.response.status >= 500 && err.response.status <= 599)) {
                this.setState({
                    userData: {...this.state.userData, loaded: true, loggedIn: false}
                });
                return;
            }
            this.setState({
                userData: {...this.state.userData, loaded: true, loggedIn: false, error: true}
            });
        });
    }

    onLogin = (token) => {
        //setting loaded to false because it was already loaded before this method call
        this.setState({
            session: token,
            userData: {...this.state.userData, loaded: false},
            serviceData: {...this.state.serviceData, loaded: false}
        });
        //forcing reupdate the props
        this.componentDidMount();
    };

    onLogOut = () => {
        Cookies.remove("FSID");
        this.setState({
            session: null,
            userData: {...this.state.userData, data: [], loaded: true, loggedIn: false}
        });
        this.componentDidMount();
    };

    onFilteringUpdate = (filter, boardData, history) => {
        localStorage.setItem("searchFilter", filter);
        this.setState({
            search: {...this.state.search, filter},
        });
        this.boardRedirect(history, boardData);
    };

    onSortingUpdate = (sort, boardData, history) => {
        localStorage.setItem("searchSort", sort);
        this.setState({
            search: {...this.state.search, sort}
        });
        this.boardRedirect(history, boardData);
    };

    boardRedirect = (history, boardData) => {
        history.push({
            pathname: "/brdr/" + boardData.discriminator,
            state: {_boardData: boardData},
        });
    };

    getTheme = () => {
        let color = tinycolor(this.state.theme);
        if (this.state.darkMode) {
            color = color.lighten(10);
            //if still not readable, increase again
            if (tinycolor.readability(color, "#282828") < 2.5) {
                color = color.lighten(25);
            }
        }
        return color;
    };

    onDarkModeToggle = () => {
        let darkMode = (localStorage.getItem("darkMode") === 'true');
        localStorage.setItem("darkMode", (!darkMode).toString());
        this.setState({
            darkMode: !darkMode
        });
        if (darkMode) {
            document.body.classList.remove("dark");
        } else {
            document.body.classList.add("dark");
        }
    };

    render() {
        if (this.state.serviceData.error) {
            return <BrowserRouter><ErrorView icon={<FaDizzy className="error-icon"/>} message="Service Is Temporarily Unavailable"/></BrowserRouter>
        }
        return <ComponentLoader loader={<Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>}
                                loaded={this.state.serviceData.loaded && this.state.userData.loaded} component={
            <AppContext.Provider value={{
                user: {
                    data: this.state.userData.data,
                    loggedIn: this.state.userData.loggedIn,
                    session: this.state.session,
                    searchPreferences: this.state.search,
                    darkMode: this.state.darkMode,
                    onLogOut: this.onLogOut,
                },
                serviceData: this.state.serviceData.data,
                onFilteringUpdate: this.onFilteringUpdate,
                onSortingUpdate: this.onSortingUpdate,
                onDarkModeToggle: this.onDarkModeToggle,
                getTheme: this.getTheme,
                theme: this.state.theme,
                onThemeChange: theme => this.setState({theme}),
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
                        <Route path="/auth/:provider" render={() => <OauthReceiver onLogin={this.onLogin}/>}/>
                        <Route render={() => <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>}/>
                    </Switch>
                </Suspense>
            </AppContext.Provider>
        }/>
    }
}

export default App;
