import React, {Component} from 'react';
import {Container, Row} from "react-bootstrap";
import {FaExclamationCircle} from "react-icons/fa";
import axios from "axios";
import GeneralSettings from "./subviews/general-settings";
import {Route, Switch} from "react-router-dom";
import IdeaNavbar from "../../components/navbars/idea-navbar";
import LoadingSpinner from "../../components/util/loading-spinner";
import ErrorView from "../errors/error-view";
import AppContext from "../../context/app-context";
import TagsSettings from "./subviews/tags-settings";
import InvitationsSettings from "./subviews/invitations-settings";
import {getSimpleRequestConfig} from "../../components/util/utils";
import ModeratorsSettings from "./subviews/moderators-settings";
import WebhooksSettings from "./subviews/webhooks/webhooks-settings";
import SocialLinksSettings from "./subviews/social/social-links-settings";
import CreateSocialLink from "./subviews/social/create-social-link";
import CreateWebhook from "./subviews/webhooks/create-webhook";

class AdminPanelView extends Component {

    static contextType = AppContext;

    state = {
        id: this.props.match.params.id,
        loaded: false,
        error: false,
        data: [],
    };

    componentDidMount() {
        if (this.props.location.state != null) {
            this.resolvePassedData();
            return;
        }
        axios.get(this.context.apiRoute + "/boards/" + this.state.id, getSimpleRequestConfig(this.context.user.session))
            .then(res => {
                if (res.status !== 200) {
                    this.setState({error: true});
                }
                const data = res.data;
                this.setState({data, loaded: true});
            }).catch(() => {
            this.setState({error: true})
        });
    }

    resolvePassedData() {
        const state = this.props.location.state;
        this.context.onThemeChange(state._boardData.themeColor);
        this.setState({
            data: state._boardData, loaded: true,
        });
    }

    reRouteTo = (destination) => {
        this.props.history.push({
            pathname: "/bardr/" + this.state.data.discriminator + "/" + destination,
            state: {
                _boardData: this.state.data,
            },
        });
    };

    render() {
        if (this.props.location.state != null && !this.state.loaded) {
            return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>;
        }
        if (this.state.error) {
            return <ErrorView iconMd={<FaExclamationCircle style={{fontSize: 250, color: "#c0392b"}}/>}
                              iconSm={<FaExclamationCircle style={{fontSize: 180, color: "#c0392b"}}/>}
                              message="Content Not Found"/>
        }
        if (!this.state.loaded) {
            return <Row className="justify-content-center"><LoadingSpinner/></Row>
        }
        if (!this.context.user.loggedIn) {
            this.props.history.push("/b/" + this.state.id);
            return <React.Fragment/>;
        }
        return <React.Fragment>
            <IdeaNavbar name={this.state.data.name} logoUrl={this.state.data.logo} discriminator={this.state.data.discriminator}/>
            <Container>
                <Row className="justify-content-center pb-4">
                    <Switch>
                        <Route path="/ba/:id/invitations" render={() => <InvitationsSettings reRouteTo={this.reRouteTo} data={this.state.data}/>}/>
                        <Route path="/ba/:id/tags" render={() => <TagsSettings reRouteTo={this.reRouteTo} data={this.state.data}/>}/>
                        <Route path="/ba/:id/moderators" render={() => <ModeratorsSettings reRouteTo={this.reRouteTo} data={this.state.data}/>}/>
                        <Route path="/ba/:id/webhooks/create" render={() => <CreateWebhook reRouteTo={this.reRouteTo} data={this.state.data}/>}/>
                        <Route path="/ba/:id/webhooks" render={() => <WebhooksSettings reRouteTo={this.reRouteTo} data={this.state.data}/>}/>
                        <Route path="/ba/:id/social/create" render={() => <CreateSocialLink reRouteTo={this.reRouteTo} data={this.state.data}/>}/>
                        <Route path="/ba/:id/social" render={() => <SocialLinksSettings reRouteTo={this.reRouteTo} data={this.state.data}/>}/>
                        <Route path="/ba/:id/general" render={(props) => <GeneralSettings reRouteTo={this.reRouteTo} onLogoChange={this.onLogoChange} onThemeChange={this.onThemeChange}
                                                                                          data={this.state.data} {...props}/>}/>
                        <Route render={(props) => <GeneralSettings reRouteTo={this.reRouteTo} onLogoChange={this.onLogoChange} onThemeChange={this.onThemeChange}
                                                                   data={this.state.data} {...props}/>}/>
                    </Switch>
                </Row>
            </Container>
        </React.Fragment>
    }

    onLogoChange = (data) => {
        this.setState({
            data: {
                ...this.state.data,
                logo: data,
            }
        });
    };
}

export default AdminPanelView;