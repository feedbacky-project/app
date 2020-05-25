import React, {Component} from 'react';
import AppContext from "context/app-context";
import axios from "axios";
import {prettifyEnum, toastError, toastSuccess} from "components/util/utils";
import AdminSidebar from "components/sidebar/admin-sidebar";
import {Badge, Button, Col} from "react-bootstrap";
import LoadingSpinner from "components/util/loading-spinner";
import {Link} from "react-router-dom";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import DeleteButton from "components/util/delete-button";
import ViewBox from "components/viewbox/view-box";

class WebhooksSettings extends Component {

    static contextType = AppContext;

    state = {
        data: [],
        loaded: false,
        error: false,
    };

    componentDidMount() {
        axios.get("/boards/" + this.props.data.discriminator + "/webhooks").then(res => {
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
            <Col xs={12} md={9}>
                <ViewBox theme={this.context.getTheme()} title="Webhooks"
                         description="Edit webhooks to integrate with other apps here.">
                    {this.renderContent()}
                </ViewBox>
            </Col>
        </React.Fragment>
    }

    renderContent() {
        if (this.state.error) {
            return <span className="text-danger">Failed to obtain webhooks data</span>
        }
        if (!this.state.loaded) {
            return <LoadingSpinner/>
        }
        return this.renderWebhooks();
    }

    renderWebhooks() {
        return <React.Fragment>
            <Col xs={12} className="mb-sm-0 mb-3">
                <div className="text-black-60 mb-1">
                    <span className="mr-1">Webhooks Quota ({this.calculateLeft()} left)</span>
                    <ClickableTip id="moderatorsQuota" title="Webhooks Quota"
                                  description="Amount of webhooks your board can have."/>
                </div>
                {this.state.data.map((hook, i) => {
                    return <div className="d-inline-flex justify-content-center mr-2" key={hook.id}>
                        <div className="text-center">
                            <img alt="Webhook" className="rounded bg-dark p-2" src={this.getTypeIcon(hook)} height={40}
                                 width={40}/>
                            <DeleteButton id={"webhook_del_" + i} onClick={() => this.onWebhookDelete(hook)}
                                          tooltipName="Delete"/>
                            <br/>
                            <small className="text-truncate text-center d-block"
                                   style={{maxWidth: 100}}>{prettifyEnum(hook.type) + " #" + hook.id}</small>
                            {this.renderEvents(hook)}
                        </div>
                    </div>
                })}
                <div>
                    <Button className="text-white m-0 mt-3 float-right" variant="" style={{backgroundColor: this.context.getTheme()}}
                            as={Link} to={"/ba/" + this.props.data.discriminator + "/webhooks/create"}>Add New</Button>
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
            default:
                return "";
        }
    };

    renderEvents = (hook) => {
        return hook.events.map((event, i) => {
            return <React.Fragment key={hook.id}>
                <Badge variant="" style={{backgroundColor: this.context.getTheme()}}>{prettifyEnum(event)}</Badge>
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
                axios.delete("/webhooks/" + hook.id).then(res => {
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