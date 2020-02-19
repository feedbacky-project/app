import React, {Component} from 'react';
import BoardNavbar from "../components/navbars/BoardNavbar";
import BoardSearchBar from "../components/board/searchbar/BoardSearchBar";
import BoardContainer from "../components/board/ideas/container/BoardContainer";
import axios from "axios";
import ErrorView from "./errors/ErrorView";
import {FaExclamationCircle} from "react-icons/fa";
import {Container, Row} from "react-bootstrap";
import LoginModal from "../components/modal/LoginModal";
import BoardBanner from "../components/board/BoardBanner";
import LoadingSpinner from "../components/util/LoadingSpinner";
import AppContext from "../context/AppContext";
import {getSimpleRequestConfig} from "../components/util/Utils";

class Board extends Component {

    static contextType = AppContext;

    state = {
        id: this.props.match.params.id,
        loaded: false,
        error: false,
        data: [],
        moderators: [],
        moderatorsLoaded: false,
        loginModalOpened: false,
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
        //ensure it's private and data is null for private that can't be seen
        if (this.state.data.privatePage && this.state.data.name == null) {
            return <React.Fragment>
                <LoginModal open={this.state.loginModalOpened} image={"https://cdn.feedbacky.net/static/svg/question.svg"}
                            boardName={"Private Board"}
                            redirectUrl={"b/" + this.state.data.discriminator}
                            onLoginModalClose={this.onLoginModalClose}/>
                <BoardNavbar name={"Private Board"}
                             logoUrl={"https://cdn.feedbacky.net/static/svg/question.svg"}
                             onNotLoggedClick={this.onNotLoggedClick}/>
                <Container className="pb-5">
                    <Row className="pb-4">
                        <BoardBanner name={"Private Board"} description={"You don't have permission to view this board."}
                                     bannerUrl={"https://cdn.feedbacky.net/static/img/private_project.png"} socialLinks={[]}/>
                        <BoardSearchBar history={this.props.history} discriminator={this.state.data.discriminator} boardData={this.state.data} moderators={this.state.moderators}/>
                    </Row>
                </Container>
            </React.Fragment>
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

export default Board;
