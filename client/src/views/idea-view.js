import React, {Component} from 'react';
import axios from "axios";
import ErrorView from "./errors/error-view";
import {FaExclamationCircle, FaSadTear} from "react-icons/fa";
import IdeaNavbar from "../components/navbars/idea-navbar";
import LoginModal from "../components/modal/login-modal";
import LoadingSpinner from "../components/util/loading-spinner";
import IdeaDetailsBox from "../components/idea/idea-details-box";
import DiscussionBox from "../components/idea/discussion-box";
import {Col, Container, Row} from "react-bootstrap";
import AppContext from "../context/app-context";
import {getSimpleRequestConfig} from "../components/util/utils";
import {FaEyeSlash} from "react-icons/all";

class IdeaView extends Component {

    static contextType = AppContext;

    state = {
        id: this.props.match.params.id,
        ideaData: [],
        ideaDataLoaded: false,
        ideaDataError: false,
        boardData: [],
        boardDataLoaded: false,
        boardDataError: false,
        moderators: [],
        moderatorsLoaded: false,
        moderatorsDataError: false,
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
            ideaData: {
                ...this.state.ideaData,
                upvoted,
                votersAmount
            }
        });
        this.resetStateHistory();
    };

    onCommentDelete = () => {
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                commentsAmount: this.state.ideaData.commentsAmount - 1
            }
        });
        this.resetStateHistory();
    };

    onCommentPost = () => {
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                commentsAmount: this.state.ideaData.commentsAmount + 1
            }
        });
        this.resetStateHistory();
    };

    onIdeaEdit = (description) => {
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                description: description,
                edited: true,
            }
        });
        this.resetStateHistory();
    };

    onStateChange = (bool) => {
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                open: bool,
            }
        });
        this.resetStateHistory();
    };

    onTagsUpdate = (data) => {
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                tags: data,
            }
        });
        this.resetStateHistory();
    };

    onAttachmentDelete = (url) => {
        let attachments = this.state.ideaData.attachments.filter(data => data.url !== url);
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                attachments,
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
        if(this.props.location.state != null) {
            this.resolvePassedData();
            return;
        }
        if(this.state.ideaDataLoaded) {
            this.loadModeratorDataCascade(this.state.boardData);
            return;
        }
        axios.get(this.context.apiRoute + "/ideas/" + this.state.id, getSimpleRequestConfig(this.context.user.session))
            .then(res => {
                if (res.status !== 200) {
                    this.setState({ideaDataError: true});
                    return;
                }
                const ideaData = res.data;
                if (ideaData.title === null && ideaData.user === null) {
                    this.setState({ideaDataLoaded: true, boardDataLoaded: true, moderatorsLoaded: true, privatePage: true});
                    return;
                }
                ideaData.tags.sort((a, b) => a.name.localeCompare(b.name));
                this.setState({ideaData, ideaDataLoaded: true});
                this.loadBoardDataCascade(ideaData);
            }).catch(() => {
            this.setState({ideaDataError: true})
        });
    }

    resolvePassedData() {
        const state = this.props.location.state;
        this.context.onThemeChange(state._boardData.themeColor);
        this.setState({
            ideaData: state._ideaData, ideaDataLoaded: true,
            boardData: state._boardData, boardDataLoaded: true,
            moderators: state._moderators, moderatorsLoaded: true,
        });
    }

    loadBoardDataCascade(ideaData) {
        if (this.state.boardDataLoaded) {
            this.loadModeratorDataCascade(this.state.boardData);
            return;
        }
        axios.get(this.context.apiRoute + "/boards/" + ideaData.boardDiscriminator, getSimpleRequestConfig(this.context.user.session))
            .then(res => {
                if (res.status !== 200) {
                    this.setState({boardDataError: true});
                    return;
                }
                const boardData = res.data;
                boardData.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
                this.setState({boardData, boardDataLoaded: true});
                this.context.onThemeChange(boardData.themeColor);
                this.loadModeratorDataCascade(boardData);
            }).catch(() => {
            this.setState({boardDataError: true});
        });
    }

    loadModeratorDataCascade(boardData) {
        if (this.state.moderatorsLoaded) {
            return;
        }
        axios.get(this.context.apiRoute + "/boards/" + boardData.discriminator + "/moderators", getSimpleRequestConfig(this.context.user.session))
            .then(response => {
                if (response.status !== 200) {
                    this.setState({error: true});
                }
                const moderators = response.data;
                this.setState({moderators, moderatorsLoaded: true});
            }).catch(() => {
            this.setState({error: true})
        });
    }

    render() {
        if (this.state.ideaDataError) {
            return <ErrorView iconMd={<FaExclamationCircle style={{fontSize: 250, color: "#c0392b"}}/>}
                              iconSm={<FaExclamationCircle style={{fontSize: 180, color: "#c0392b"}}/>}
                              message="Content Not Found"/>
        }
        if (this.state.boardDataError || this.state.moderatorsDataError) {
            return <ErrorView iconMd={<FaSadTear style={{fontSize: 250, color: "#e67e22"}}/>}
                              iconSm={<FaSadTear style={{fontSize: 180, color: "#e67e22"}}/>}
                              message="Server Connection Error"/>
        }
        if (!this.state.boardDataLoaded || !this.state.moderatorsLoaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
        }

        if (this.state.privatePage) {
            return <ErrorView iconMd={<FaEyeSlash style={{fontSize: 250, color: "#3299ff"}}/>}
                              iconSm={<FaEyeSlash style={{fontSize: 180, color: "#3299ff"}}/>}
                              message="This Idea Is Private"/>
        }
        return <React.Fragment>
            <LoginModal open={this.state.loginModalOpened} onLoginModalClose={this.onLoginModalClose}
                        image={this.state.boardData.logo} boardName={this.state.boardData.name} redirectUrl={"i/" + this.state.ideaData.id}/>
            <IdeaNavbar name={this.state.boardData.name} logoUrl={this.state.boardData.logo}
                        discriminator={this.state.boardData.discriminator} onNotLoggedClick={this.onNotLoggedClick} {...this.state}/>
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
        if (!this.state.ideaDataLoaded) {
            return <div className="my-5"><LoadingSpinner/></div>
        }
        return <IdeaDetailsBox moderators={this.state.moderators} ideaData={this.state.ideaData} onNotLoggedClick={this.onNotLoggedClick}
                               onStateUpdate={this.onStateUpdate} onIdeaEdit={this.onIdeaEdit} onAttachmentDelete={this.onAttachmentDelete}
                               onTagsUpdate={this.onTagsUpdate} onStateChange={this.onStateChange} {...this.props}/>
    }

    renderDiscussion() {
        if (!this.state.ideaDataLoaded) {
            return <div className="mt-4"><LoadingSpinner/></div>
        }
        return <DiscussionBox onCommentPost={this.onCommentPost} onCommentDelete={this.onCommentDelete} moderators={this.state.moderators}
                              ideaData={this.state.ideaData} onNotLoggedClick={this.onNotLoggedClick}/>
    }
}

export default IdeaView;