import React, {Component} from 'react';
import AppContext from "../../../../context/app-context";
import axios from "axios";
import {getSimpleRequestConfig, prettifyEnum, toastError, toastSuccess} from "../../../../components/util/utils";
import AdminSidebar from "../../../../components/sidebar/admin-sidebar";
import {Badge, Button, Col, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import LoadingSpinner from "../../../../components/util/loading-spinner";
import {Link} from "react-router-dom";
import {popupSwal} from "../../../../components/util/sweetalert-utils";
import {FaTimesCircle} from "react-icons/all";
import ClickableTip from "../../../../components/util/clickable-tip";

class WebhooksSettings extends Component {

    static contextType = AppContext;

    state = {
        data: [],
        loaded: false,
        error: false,
    };

    componentDidMount() {
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/webhooks", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({error: true});
                return;
            }
            const data = res.data;
            this.setState({data, loaded: true});
        }).catch(() => this.setState({error: true}));
    }

    calculateLeft() {
        return 5 - this.state.data.length;
    }

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="webhooks" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col xs={12} md={9} className="mt-4">
                <h2 className="h2-responsive mb-3">Webhooks</h2>
                {this.renderContent()}
            </Col>
        </React.Fragment>
    }

    renderContent() {
        if (this.state.error) {
            return <span className="text-danger">Failed to obtain webhooks data</span>
        }
        if (!this.state.loaded) {
            return <Row className="mt-4 ml-2"><LoadingSpinner/></Row>
        }
        return <Col className="mb-3">
            <Row className="py-4 px-sm-2 px-0 rounded-top box-overlay">
                {this.renderWebhooks()}
            </Row>
        </Col>
    }

    renderWebhooks() {
        return <React.Fragment>
            <Col xs={12} sm={6} className="mb-sm-0 mb-3">
                <div className="text-black-60 mb-1">
                    <span className="mr-1">Webhooks Quota ({this.calculateLeft()} left)</span>
                    <ClickableTip id="moderatorsQuota" title="Webhooks Quota" description="Amount of webhooks your board can have."/>
                </div>
                {this.state.data.map((hook, i) => {
                    return <div className="d-inline-flex justify-content-center mr-2" key={"boardWebhook_" + i}>
                        <div className="text-center">
                            <img alt="Webhook" className="rounded bg-dark p-2" src={this.getTypeIcon(hook)} height={40} width={40}/>
                            {this.renderWebhookDelete(hook, i)}
                            <br/>
                            <small className="text-truncate text-center d-block" style={{maxWidth: 100}}>{prettifyEnum(hook.type) + " #" + hook.id}</small>
                            {this.renderEvents(hook)}
                        </div>
                    </div>
                })}
                <div>
                    <Button className="btn-smaller text-white m-0 mt-3" variant="" style={{backgroundColor: this.context.theme}} as={Link} to={"/ba/" + this.props.data.discriminator + "/webhooks/create"}>Add New</Button>
                </div>
            </Col>
        </React.Fragment>
    }

    getTypeIcon = (hook) => {
        switch (hook.type) {
            case "DISCORD":
                return "https://cdn.feedbacky.net/social/default-discord.svg";
            case "CUSTOM_ENDPOINT":
                return "https://cdn.feedbacky.net/social/default-website.svg";
        }
    };

    renderWebhookDelete = (hook, i) => {
        return <OverlayTrigger overlay={<Tooltip id={"deleteWebhook" + i + "-tooltip"}>Delete</Tooltip>}>
            <FaTimesCircle className="grey lighten-2 black-text rounded-circle" onClick={() => this.onWebhookDelete(hook)} style={{position: "absolute", transform: "translate(-6px, -6px)"}}/>
        </OverlayTrigger>;
    };

    renderEvents = (hook) => {
        return hook.events.map((event, i) => {
            return <React.Fragment key={"e" + hook.id + "_" + i}>
                <Badge variant="primary">{prettifyEnum(event)}</Badge>
                <br/>
            </React.Fragment>
        });
    };

    onWebhookDelete = (hook) => {
        popupSwal("warning", "Dangerous action", "Webhook will be permanently removed and won't send data to target URL.",
            "Delete", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/webhooks/" + hook.id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = this.state.data.filter(item => item.id !== hook.id);
                    this.setState({data});
                    toastSuccess("Webhook deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };

}

export default WebhooksSettings;