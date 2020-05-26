import React, {Component} from 'react';
import BoardNavbar from "components/navbars/board-navbar";
import BoardSearchBar from "components/board/searchbar/board-search-bar";
import BoardContainer from "components/board/ideas/board-container";
import axios from "axios";
import ErrorView from "views/errors/error-view";
import {FaExclamationCircle} from "react-icons/fa";
import {Container, Row} from "react-bootstrap";
import LoginModal from "components/modal/login-modal";
import BoardBanner from "components/board/board-banner";
import LoadingSpinner from "components/util/loading-spinner";
import AppContext from "context/app-context";
import {FaEyeSlash} from "react-icons/all";
import BoardContext from "context/board-context";

class BoardView extends Component {

    static contextType = AppContext;

    state = {
        board: {data: [], loaded: false, error: false},
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
        if (this.state.board.loaded) {
            return;
        }
        axios.get("/boards/" + this.props.match.params.id).then(res => {
            if (res.status !== 200) {
                this.setState({
                    board: {...this.state.board, error: true}
                });
                return;
            }
            const data = res.data;
            if (data.privatePage && data.name === null) {
                this.setState({
                    board: {...this.state.board, loaded: true},
                    privatePage: true
                });
                return;
            }
            data.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
            this.context.onThemeChange(data.themeColor || "#343a40");
            this.setState({
                board: {...this.state.board, data, loaded: true}
            });
        }).catch(() => this.setState({
            board: {...this.state.board, error: true}
        }));
    }

    resolvePassedData() {
        const state = this.props.location.state;
        if (state._boardData !== undefined) {
            this.context.onThemeChange(state._boardData.themeColor || "#343a40");
            this.setState({
                board: {...this.state.board, data: state._boardData, loaded: true}
            });
            return true;
        }
        return false;
    }

    render() {
        if (this.state.board.error) {
            return <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>
        }
        if (!this.state.board.loaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
        }

        if (this.state.privatePage) {
            return <ErrorView icon={<FaEyeSlash className="error-icon"/>} message="This Board Is Private"/>
        }
        return <BoardContext.Provider value={{data: this.state.board.data, loaded: this.state.board.loaded, error: this.state.board.error}}>
            <LoginModal open={this.state.loginModalOpened} image={this.state.board.data.logo}
                        boardName={this.state.board.data.name} redirectUrl={"b/" + this.state.board.data.discriminator}
                        onLoginModalClose={this.onLoginModalClose}/>
            <BoardNavbar onNotLoggedClick={this.onNotLoggedClick}/>
            <Container className="pb-5">
                <Row className="pb-4">
                    <BoardBanner/>
                    <BoardSearchBar/>
                    <BoardContainer id={this.props.match.params.id} onNotLoggedClick={this.onNotLoggedClick}/>
                </Row>
            </Container>
        </BoardContext.Provider>
    }
}

export default BoardView;
