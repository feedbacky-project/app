import React, {Component} from 'react';
import BoardNavbar from "../components/navbars/board-navbar";
import BoardSearchBar from "../components/board/searchbar/board-search-bar";
import BoardContainer from "../components/board/ideas/container/board-container";
import axios from "axios";
import ErrorView from "./errors/error-view";
import {FaExclamationCircle} from "react-icons/fa";
import {Container, Row} from "react-bootstrap";
import LoginModal from "../components/modal/login-modal";
import BoardBanner from "../components/board/board-banner";
import LoadingSpinner from "../components/util/loading-spinner";
import AppContext from "../context/app-context";
import {getSimpleRequestConfig} from "../components/util/utils";
import {FaEyeSlash} from "react-icons/all";

class BoardView extends Component {

    static contextType = AppContext;

    state = {
        id: this.props.match.params.id,
        loaded: false,
        error: false,
        data: [],
        moderators: [],
        moderatorsLoaded: false,
        loginModalOpened: false,
        privatePage: false
    };

    //workaround for refs that don't properly work with react router links...
    onNotLoggedClick = () => {
        this.setState({loginModalOpened: true});
    };

    onLoginModalClose = () => {
        this.setState({loginModalOpened: false});
    };

    componentDidMount() {
        if (this.props.location.state != null) {
            if (this.resolvePassedData()) {
                return;
            }
        }
        if (!this.state.loaded) {
            axios.get(this.context.apiRoute + "/boards/" + this.state.id, getSimpleRequestConfig(this.context.user.session))
                .then(res => {
                    if (res.status !== 200) {
                        this.setState({error: true});
                    }
                    const data = res.data;
                    if (data.privatePage && data.name === null) {
                        this.setState({loaded: true, privatePage: true});
                        return;
                    }
                    data.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
                    this.context.onThemeChange(data.themeColor || "#343a40");
                    this.setState({data, loaded: true});
                }).catch(() => {
                this.setState({error: true})
            });
        }
        if (!this.state.moderatorsLoaded) {
            axios.get(this.context.apiRoute + "/boards/" + this.state.id + "/moderators", getSimpleRequestConfig(this.context.user.session))
                .then(res => {
                    if (res.status !== 200) {
                        this.setState({error: true});
                    }
                    const moderators = res.data;
                    this.setState({moderators, moderatorsLoaded: true});
                }).catch(() => {
                this.setState({error: true})
            });
        }
    }

    resolvePassedData() {
        const state = this.props.location.state;
        if (state._boardData !== undefined && state._moderators !== undefined) {
            this.context.onThemeChange(state._boardData.themeColor || "#343a40");
            this.setState({
                data: state._boardData, loaded: true,
                moderators: state._moderators, moderatorsLoaded: true,
            });
            return true;
        }
        return false;
    }

    render() {
        if (this.state.error) {
            return <ErrorView iconMd={<FaExclamationCircle style={{fontSize: 250, color: "#c0392b"}}/>}
                              iconSm={<FaExclamationCircle style={{fontSize: 180, color: "#c0392b"}}/>}
                              message="Content Not Found"/>
        }
        if (!this.state.loaded || !this.state.moderatorsLoaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
        }

        if (this.state.privatePage) {
            return <ErrorView iconMd={<FaEyeSlash style={{fontSize: 250, color: "#3299ff"}}/>}
                              iconSm={<FaEyeSlash style={{fontSize: 180, color: "#3299ff"}}/>}
                              message="This Board Is Private"/>
        }
        return <React.Fragment>
            <LoginModal open={this.state.loginModalOpened} image={this.state.data.logo}
                        boardName={this.state.data.name} redirectUrl={"b/" + this.state.data.discriminator}
                        onLoginModalClose={this.onLoginModalClose}/>
            <BoardNavbar name={this.state.data.name} logoUrl={this.state.data.logo}
                         onNotLoggedClick={this.onNotLoggedClick}/>
            <Container className="pb-5">
                <Row className="pb-4">
                    <BoardBanner name={this.state.data.name} description={this.state.data.shortDescription}
                                 bannerUrl={this.state.data.banner} socialLinks={this.state.data.socialLinks}/>
                    <BoardSearchBar history={this.props.history} discriminator={this.state.data.discriminator} boardData={this.state.data} moderators={this.state.moderators}/>
                    <BoardContainer boardData={this.state.data} id={this.state.id} onNotLoggedClick={this.onNotLoggedClick} moderators={this.state.moderators}/>
                </Row>
            </Container>
        </React.Fragment>
    }
}

export default BoardView;
