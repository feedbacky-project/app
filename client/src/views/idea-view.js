import React, {Component} from 'react';
import axios from "axios";
import ErrorView from "views//errors/error-view";
import {FaExclamationCircle, FaSadTear} from "react-icons/fa";
import IdeaNavbar from "components/navbars/idea-navbar";
import LoginModal from "components/modal/login-modal";
import LoadingSpinner from "components/util/loading-spinner";
import IdeaDetailsBox from "components/idea/details/idea-details-box";
import DiscussionBox from "components/idea/discussion/discussion-box";
import {Col, Container, Row} from "react-bootstrap";
import AppContext from "context/app-context";
import {FaEyeSlash} from "react-icons/all";
import ComponentLoader from "components/app/component-loader";
import BoardContext from "context/board-context";

class IdeaView extends Component {

    static contextType = AppContext;

    state = {
        id: this.props.match.params.id,
        idea: {data: [], loaded: false, error: false},
        board: {data: [], loaded: false, error: false},
        loginModalOpened: false,
        privatePage: false,
    };

    //workaround for refs that don't properly work with react router links...
    onNotLoggedClick = () => {
        this.setState({loginModalOpened: true});
    };

    onLoginModalClose = () => {
        this.setState({loginModalOpened: false});
    };

    updateState = (data) => {
        this.setState({idea: {...this.state.idea, data}});
        this.resetStateHistory();
    };

    resetStateHistory = () => {
        this.props.history.replace({
            pathname: this.props.location.pathname,
            state: null,
        });
    };

    componentDidMount() {
        if (this.props.location.state != null) {
            this.resolvePassedData();
            return;
        }
        if (this.state.idea.loaded) {
            return;
        }
        axios.get("/ideas/" + this.state.id).then(res => {
            if (res.status !== 200) {
                this.setState({
                    idea: {...this.state.idea, error: true, loaded: true,}
                });
                return;
            }
            const ideaData = res.data;
            if (ideaData.title === null && ideaData.user === null) {
                this.setState({
                    idea: {...this.state.idea, loaded: true},
                    board: {...this.state.board, loaded: true},
                    privatePage: true,
                });
                return;
            }
            ideaData.tags.sort((a, b) => a.name.localeCompare(b.name));
            this.setState({
                idea: {...this.state.idea, data: ideaData, loaded: true}
            });
            this.loadBoardDataCascade(ideaData);
        }).catch(() => this.setState({
            idea: {...this.state.idea, error: true, loaded: true,}
        }));
    }

    resolvePassedData() {
        const state = this.props.location.state;
        this.context.onThemeChange(state._boardData.themeColor);
        this.setState({
            idea: {...this.state.idea, data: state._ideaData, loaded: true},
            board: {...this.state.board, data: state._boardData, loaded: true}
        });
    }

    loadBoardDataCascade(ideaData) {
        if (this.state.board.loaded) {
            return;
        }
        axios.get("/boards/" + ideaData.boardDiscriminator).then(res => {
            if (res.status !== 200) {
                this.setState({
                    board: {...this.state.board, error: true}
                });
                return;
            }
            const boardData = res.data;
            boardData.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
            this.setState({
                board: {...this.state.board, data: boardData, loaded: true}
            });
            this.context.onThemeChange(boardData.themeColor);
        }).catch(() => this.setState({
            board: {...this.state.board, error: true}
        }));
    }

    render() {
        if (this.state.idea.error) {
            return <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>
        }
        if (this.state.board.error) {
            return <ErrorView icon={<FaSadTear className="error-icon"/>} message="Server Connection Error"/>
        }
        if (!this.state.board.loaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
        }

        if (this.state.privatePage) {
            return <ErrorView icon={<FaEyeSlash className="error-icon"/>} message="This Idea Is Private"/>
        }
        return <BoardContext.Provider value={{data: this.state.board.data, loaded: this.state.board.loaded, error: this.state.board.error}}>
            <LoginModal open={this.state.loginModalOpened} onLoginModalClose={this.onLoginModalClose}
                        image={this.state.board.data.logo} boardName={this.state.board.data.name} redirectUrl={"i/" + this.state.idea.data.id}/>
            <IdeaNavbar onNotLoggedClick={this.onNotLoggedClick}/>
            <Container className="pb-5">
                <Row className="justify-content-center pb-4">
                    <ComponentLoader loaded={this.state.board.loaded} component={<IdeaDetailsBox updateState={this.updateState} moderators={this.state.board.data.moderators}
                                                                ideaData={this.state.idea.data} onNotLoggedClick={this.onNotLoggedClick} {...this.props}/>}/>
                    <Col xs={12}>
                        <hr/>
                    </Col>
                    <ComponentLoader loaded={this.state.idea.loaded} component={<DiscussionBox updateState={this.updateState} moderators={this.state.board.data.moderators}
                                                               ideaData={this.state.idea.data} onNotLoggedClick={this.onNotLoggedClick}/>}/>
                </Row>
            </Container>
        </BoardContext.Provider>
    }
}

export default IdeaView;