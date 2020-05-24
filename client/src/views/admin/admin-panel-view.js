import React, {Component} from 'react';
import {Container, Row} from "react-bootstrap";
import {FaExclamationCircle} from "react-icons/fa";
import axios from "axios";
import GeneralSettings from "views/admin/subviews/general-settings";
import {Route, Switch} from "react-router-dom";
import IdeaNavbar from "components/navbars/idea-navbar";
import LoadingSpinner from "components/util/loading-spinner";
import ErrorView from "views/errors/error-view";
import AppContext from "context/app-context";
import TagsSettings from "views/admin/subviews/tags-settings";
import InvitationsSettings from "views/admin/subviews/invitations-settings";
import ModeratorsSettings from "views/admin/subviews/moderators-settings";
import WebhooksSettings from "views/admin/subviews/webhooks/webhooks-settings";
import SocialLinksSettings from "views/admin/subviews/social/social-links-settings";
import CreateSocialLink from "views/admin/subviews/social/create-social-link";
import CreateWebhook from "views/admin/subviews/webhooks/create-webhook";

class AdminPanelView extends Component {

    static contextType = AppContext;

    state = {
        id: this.props.match.params.id,
        board: {data: [], loaded: false, error: false}
    };

    componentDidMount() {
        if (this.props.location.state != null) {
            this.resolvePassedData();
            return;
        }
        axios.get("/boards/" + this.state.id).then(res => {
            if (res.status !== 200) {
                this.setState({
                    board: {...this.state.board, error: true}
                });
            }
            const data = res.data;
            this.setState({
                board: {...this.state.board, data, loaded: true}
            });
            this.context.onThemeChange(data.themeColor);
        }).catch(() => this.setState({
            board: {...this.state.board, error: true}
        }));
    }

    resolvePassedData() {
        const state = this.props.location.state;
        this.context.onThemeChange(state._boardData.themeColor);
        this.setState({
            board: {...this.state.board, data: state._boardData, loaded: true}
        });
    }

    reRouteTo = (destination) => {
        this.props.history.push({
            pathname: "/bardr/" + this.state.board.data.discriminator + "/" + destination,
            state: {
                _boardData: this.state.board.data,
            },
        });
    };

    render() {
        if (this.props.location.state != null && !this.state.board.loaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>;
        }
        if (this.state.board.error) {
            return <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>
        }
        if (!this.state.board.loaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
        }
        if (!this.context.user.loggedIn) {
            this.props.history.push("/b/" + this.state.id);
            return <React.Fragment/>;
        }
        return <React.Fragment>
            <IdeaNavbar boardData={this.state.board.data}/>
            <Container>
                <Row className="justify-content-center pb-4">
                    <Switch>
                        <Route path="/ba/:id/invitations" render={() => <InvitationsSettings reRouteTo={this.reRouteTo} data={this.state.board.data}/>}/>
                        <Route path="/ba/:id/tags" render={() => <TagsSettings reRouteTo={this.reRouteTo} data={this.state.board.data}/>}/>
                        <Route path="/ba/:id/moderators" render={() => <ModeratorsSettings reRouteTo={this.reRouteTo} data={this.state.board.data}/>}/>
                        <Route path="/ba/:id/webhooks/create" render={() => <CreateWebhook reRouteTo={this.reRouteTo} data={this.state.board.data}/>}/>
                        <Route path="/ba/:id/webhooks" render={() => <WebhooksSettings reRouteTo={this.reRouteTo} data={this.state.board.data}/>}/>
                        <Route path="/ba/:id/social/create" render={() => <CreateSocialLink reRouteTo={this.reRouteTo} data={this.state.board.data}/>}/>
                        <Route path="/ba/:id/social" render={() => <SocialLinksSettings reRouteTo={this.reRouteTo} data={this.state.board.data}/>}/>
                        <Route path="/ba/:id/general" render={(props) => <GeneralSettings reRouteTo={this.reRouteTo} updateState={this.updateState} onThemeChange={this.onThemeChange}
                                                                                          data={this.state.board.data} {...props}/>}/>
                        <Route render={(props) => <GeneralSettings reRouteTo={this.reRouteTo} updateState={this.updateState} onThemeChange={this.onThemeChange}
                                                                   data={this.state.board.data} {...props}/>}/>
                    </Switch>
                </Row>
            </Container>
        </React.Fragment>
    }

    updateState = (boardData) => {
        this.setState({
            board: {...this.state.board, data: boardData}
        });
    };

}

export default AdminPanelView;