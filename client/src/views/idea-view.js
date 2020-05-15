import React, {Component} from 'react';
import axios from "axios";
import ErrorView from "views//errors/error-view";
import {FaExclamationCircle, FaSadTear} from "react-icons/fa";
import IdeaNavbar from "components/navbars/idea-navbar";
import LoginModal from "components/modal/login-modal";
import LoadingSpinner from "components/util/loading-spinner";
import IdeaDetailsBox from "components/idea/idea-details-box";
import DiscussionBox from "components/idea/discussion-box";
import {Col, Container, Row} from "react-bootstrap";
import AppContext from "context/app-context";
import {FaEyeSlash} from "react-icons/all";

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

    onStateUpdate = (upvoted, votersAmount) => {
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, upvoted, votersAmount}
            }
        });
        this.resetStateHistory();
    };

    onSubscribeStateUpdate = (subscribed) => {
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, subscribed}
            }
        });
        this.resetStateHistory();
    };

    onCommentDelete = () => {
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, commentsAmount: this.state.idea.data.commentsAmount - 1}
            }
        });
        this.resetStateHistory();
    };

    onCommentPost = () => {
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, commentsAmount: this.state.idea.data.commentsAmount + 1}
            }
        });
        this.resetStateHistory();
    };

    onIdeaEdit = (description) => {
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, description, edited: true}
            }
        });
        this.resetStateHistory();
    };

    onStateChange = (open) => {
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, open}
            }
        });
        this.resetStateHistory();
    };

    onTagsUpdate = (tags) => {
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, tags}
            }
        });
        this.resetStateHistory();
    };

    onAttachmentDelete = (url) => {
        let attachments = this.state.ideaData.attachments.filter(data => data.url !== url);
        this.setState({
            idea: {
                ...this.state.idea,
                data: {...this.state.idea.data, attachments}
            }
        });
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
        return <React.Fragment>
            <LoginModal open={this.state.loginModalOpened} onLoginModalClose={this.onLoginModalClose}
                        image={this.state.board.data.logo} boardName={this.state.board.data.name} redirectUrl={"i/" + this.state.idea.data.id}/>
            <IdeaNavbar boardData={this.state.board.data} onNotLoggedClick={this.onNotLoggedClick}/>
            <Container className="pb-5">
                <Row className="justify-content-center pb-4">
                    {this.renderDetails()}
                    <Col xs="12">
                        <hr/>
                    </Col>
                    {this.renderDiscussion()}
                </Row>
            </Container>
        </React.Fragment>
    }

    renderDetails() {
        if (!this.state.idea.loaded) {
            return <div className="my-5"><LoadingSpinner/></div>
        }
        return <IdeaDetailsBox moderators={this.state.board.data.moderators} ideaData={this.state.idea.data} onNotLoggedClick={this.onNotLoggedClick}
                               onStateUpdate={this.onStateUpdate} onIdeaEdit={this.onIdeaEdit} onAttachmentDelete={this.onAttachmentDelete}
                               onTagsUpdate={this.onTagsUpdate} onStateChange={this.onStateChange} onSubscribeStateUpdate={this.onSubscribeStateUpdate} {...this.props}/>
    }

    renderDiscussion() {
        if (!this.state.idea.loaded) {
            return <div className="mt-4"><LoadingSpinner/></div>
        }
        return <DiscussionBox onCommentPost={this.onCommentPost} onCommentDelete={this.onCommentDelete} moderators={this.state.board.data.moderators}
                              ideaData={this.state.idea.data} onNotLoggedClick={this.onNotLoggedClick}/>
    }
}

export default IdeaView;