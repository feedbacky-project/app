import React, {Component, lazy, Suspense} from 'react';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import './DarkMode.css';
import './App.css';
import './AlignUtils.css';
import axios from "axios";
import {toast} from "react-toastify";
import Cookies from "js-cookie";

import ErrorView from "../../views/errors/ErrorView";
import AppContext from "../../context/AppContext";
import LoadingSpinner from "../util/LoadingSpinner";
import {FaDizzy, FaExclamationCircle} from "react-icons/fa";
import {Row} from "react-bootstrap";
import {getSimpleRequestConfig} from "../util/Utils";
import Maintenance from "../../views/Maintenance";
import {retry} from "../util/LazyInit";

const Profile = lazy(() => retry(() => import("../../views/profile/Profile")));
const CreateBoard = lazy(() => retry(() => import("../../views/creator/CreateBoard")));
const ModeratorInvitation = lazy(() => retry(() => import("../board/ModeratorInvitation")));
const BoardInvitation = lazy(() => retry(() => import("../board/BoardInvitation")));
const Board = lazy(() => retry(() => import("../../views/Board")));
const AdminPanel = lazy(() => retry(() => import("../../views/admin/AdminPanel")));
const Idea = lazy(() => retry(() => import("../../views/Idea")));
const OauthReceiver = lazy(() => retry(() => import("../../auth/OauthReceiver")));

toast.configure();

class App extends Component {

    static maintenanceMode = false;

    state = {
        session: Cookies.get("FSID"),
        search: {
            filter: localStorage.getItem("feedbacky_v1_filter"),
            sort: localStorage.getItem("feedbacky_v1_sort"),
        },
        user: [],
        darkMode: (localStorage.getItem("feedbacky_v1_dark_mode") === 'true'),
        moderates: [],
        loggedIn: false,
        loaded: false,
        error: false,
        moderatingDataLoaded: false,
        theme: "#343a40",
        apiRoute: "https://panic.feedbacky.net/v1",
    };

    componentDidMount() {
        if (App.maintenanceMode && Cookies.get("FPASS") == null) {
            return;
        }
        if (this.state.darkMode) {
            document.body.classList.add("dark");
        } else if (localStorage.getItem("feedbacky_v1_dark_mode") == null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setState({darkMode: true});
            document.body.classList.add("dark");
            localStorage.setItem("feedbacky_v1_dark_mode", "true");
        }
        if (this.state.loaded && this.state.moderatingDataLoaded) {
            return;
        }
        if (this.state.session == null) {
            this.setState({loaded: true, moderatingDataLoaded: true});
            return;
        }
        axios.get(this.state.apiRoute + "/users/@me", getSimpleRequestConfig(this.state.session)).then(res => {
            const user = res.data;
            axios.get(this.state.apiRoute + "/users/@me/permissions", getSimpleRequestConfig(this.state.session))
                .then(response => {
                    const moderates = response.data;
                    this.setState({moderates, moderatingDataLoaded: true});
                }).catch(() => {
                this.setState({/* ignore fails */ moderatingDataLoaded: true})
            });
            this.setState({user, loggedIn: true, loaded: true});
        }).catch(err => {
            if (err.response === undefined || err.response.status === 401 || err.response.status === 403) {
                this.setState({error: false, loaded: true, loggedIn: false, moderatingDataLoaded: true});
                return;
            }
            this.setState({error: true, loaded: true, moderatingDataLoaded: true});
        });
    }

    onLogin = (token) => {
        //setting loaded to false because it was already loaded before this method call
        this.setState({session: token, loaded: false, moderatingDataLoaded: false});
        //forcing reupdate the props
        this.componentDidMount();
    };

    onLogOut = () => {
        Cookies.remove("FSID");
        this.setState({session: null, user: [], moderates: [], loggedIn: false});
        this.componentDidMount();
    };

    onFilteringUpdate = (filterType, boardData, moderatorsData, history, discriminator) => {
        localStorage.setItem("feedbacky_v1_filter", filterType);
        this.setState({
            search: {
                ...this.state.search,
                filter: filterType,
            },
        });
        history.push({
            pathname: "/brdr/" + discriminator,
            state: {
                _boardData: boardData,
                _moderators: moderatorsData,
            },
        });
    };

    onSortingUpdate = (sortingType, boardData, moderatorsData, history, discriminator) => {
        localStorage.setItem("feedbacky_v1_sort", sortingType);
        this.setState({
            search: {
                ...this.state.search,
                sort: sortingType,
            }
        });
        history.push({
            pathname: "/brdr/" + discriminator,
            state: {
                _boardData: boardData,
                _moderators: moderatorsData,
            },
        });
    };

    onDarkModeToggle = () => {
        let darkMode = (localStorage.getItem("feedbacky_v1_dark_mode") === 'true');
        if (darkMode) {
            localStorage.setItem("feedbacky_v1_dark_mode", "false");
            document.body.classList.remove("dark");
            this.setState({darkMode: false});
        } else {
            localStorage.setItem("feedbacky_v1_dark_mode", "true");
            document.body.classList.add("dark");
            this.setState({darkMode: true});
        }
    };

    render() {
        if (App.maintenanceMode && Cookies.get("FPASS") == null) {
            return <BrowserRouter><Maintenance/></BrowserRouter>
        }
        if (this.state.error) {
            return <BrowserRouter><ErrorView iconMd={<FaDizzy style={{fontSize: 250, color: "#2c3e50"}}/>}
                                             iconSm={<FaDizzy style={{fontSize: 180, color: "#2c3e50"}}/>} message="Service Is Unavailable, try again in a while"/></BrowserRouter>
        }
        if (!this.state.loaded || !this.state.moderatingDataLoaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
        }
        return <AppContext.Provider value={{
            apiRoute: this.state.apiRoute,
            user: {
                data: this.state.user, loggedIn: this.state.loggedIn, session: this.state.session, moderates: this.state.moderates,
                searchPreferences: this.state.search, darkMode: this.state.darkMode, onLogOut: this.onLogOut,
            },
            onFilteringUpdate: this.onFilteringUpdate, onSortingUpdate: this.onSortingUpdate, onDarkModeToggle: this.onDarkModeToggle,
            theme: this.state.theme, onThemeChange: theme => this.setState({theme}),
        }}>
            <BrowserRouter>
                <Suspense fallback={<Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>}>
                    <Switch>
                        <Route exact path="/" render={(props) =>
                            <Profile {...props}/>}/>
                        <Route exact path="/create" render={(props) =>
                            <CreateBoard {...props}/>}/>
                        <Route path="/merdr/:section" render={(props) =>
                            <Redirect to={{
                                pathname: "/me/" + props.match.params.section,
                                state: props.location.state,
                            }}/>}/>
                        <Route path="/me/:section" render={(props) =>
                            <Profile {...props}/>}/>
                        <Route path="/me/" render={(props) =>
                            <Profile {...props}/>}/>
                        <Route path="/moderator_invitation/:code" render={(props) =>
                            <ModeratorInvitation {...props}/>}/>
                        <Route path="/invitation/:code" render={(props) =>
                            <BoardInvitation {...props}/>}/>
                        <Route path="/b/:id" render={(props) =>
                            <Board {...props}/>}/>
                        {/* sneaky way to redirect from /b/ to /b/ but with different :id parameters, because it doesn't work */}
                        <Route path="/brdr/:id" render={(props) =>
                            <Redirect to={{
                                pathname: "/b/" + props.match.params.id,
                                state: props.location.state,
                            }}/>}/>
                        <Route path="/ba/:id" render={(props) =>
                            <AdminPanel {...props}/>}/>
                        <Route path="/bardr/:id/:section" render={(props) =>
                            <Redirect to={{
                                pathname: "/ba/" + props.match.params.id + "/" + props.match.params.section,
                                state: props.location.state,
                            }}/>}/>
                        <Route path="/i/:id" render={(props) =>
                            <Idea {...props}/>}/>
                        <Route path="/auth/discord" render={(props) =>
                            <OauthReceiver provider="discord" onLogin={this.onLogin}  {...props}/>}/>
                        <Route path="/auth/google" render={(props) =>
                            <OauthReceiver provider="google" onLogin={this.onLogin}  {...props}/>}/>
                        <Route path="/auth/github" render={(props) =>
                            <OauthReceiver provider="github" onLogin={this.onLogin} {...props}/>}/>
                        <Route render={() =>
                            <ErrorView iconMd={<FaExclamationCircle style={{fontSize: 250, color: "#c0392b"}}/>}
                                       iconSm={<FaExclamationCircle style={{fontSize: 180, color: "#c0392b"}}/>} message="Content Not Found"/>}/>
                    </Switch>
                </Suspense>
            </BrowserRouter>
        </AppContext.Provider>
    }
}

export default App;
