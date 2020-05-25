import React, {Component} from 'react';
import AdminSidebar from "components/sidebar/admin-sidebar";
import {Button, Col} from "react-bootstrap";
import axios from "axios";
import {toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import LoadingSpinner from "components/util/loading-spinner";
import {Link} from "react-router-dom";
import {popupSwal} from "components/util/sweetalert-utils";
import DeleteButton from "components/util/delete-button";
import ViewBox from "components/viewbox/view-box";

class SocialLinksSettings extends Component {

    static contextType = AppContext;

    state = {
        data: [],
        loaded: false,
        error: false,
    };

    componentDidMount() {
        axios.get("/boards/" + this.props.data.discriminator + "/socialLinks").then(res => {
            if (res.status !== 200) {
                this.setState({error: true});
                return;
            }
            const links = res.data;
            this.setState({data: links, loaded: true});
        }).catch(() => this.setState({error: true}));
    }

    calculateLeft() {
        return 4 - this.state.data.length;
    }

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="social" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col xs={12} md={9}>
                <ViewBox theme={this.context.getTheme()} title="Social Links" description="Edit links visible at your board page here.">
                    {this.renderContent()}
                </ViewBox>
            </Col>
        </React.Fragment>
    }

    renderContent() {
        if (this.state.error) {
            return <span className="text-danger">Failed to obtain social links data</span>
        }
        if (!this.state.loaded) {
            return <LoadingSpinner/>
        }
        return <Col xs={12}>
            <div className="text-black-60 mb-1">Current Social Links ({this.calculateLeft()} left)</div>
            {this.state.data.map((link) => {
                return <div className="d-inline-flex justify-content-center mr-2" key={link.id}>
                    <div className="text-center" id="socialPreviewContainer">
                        <img className="bg-dark rounded p-2" alt="Logo" src={link.logoUrl} height={40} width={40}/>
                        <DeleteButton tooltipName="Delete" onClick={() => this.onSocialLinkDelete(link.id)}
                                      id={"social-" + link.id + "-del"}/>
                        <br/>
                        <a href={link.url} target="_blank" rel="noreferrer noopener" className="text-tight">{this.extractHostname(link.url)}</a>
                    </div>
                </div>
            })}
            <div>
                {this.renderAddButton()}
            </div>
        </Col>
    }

    renderAddButton() {
        if (this.calculateLeft() <= 0) {
            return <React.Fragment/>
        }
        return <Button className="text-white m-0 mt-3 float-right" variant=""
                       style={{backgroundColor: this.context.getTheme()}}
                       as={Link} to={"/ba/" + this.props.data.discriminator + "/social/create"}>Add New</Button>
    }

    extractHostname(url) {
        let hostname;
        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        } else {
            hostname = url.split('/')[0];
        }
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        return hostname.replace("www.", "");
    }

    onSocialLinkDelete = (id) => {
        popupSwal("question", "Are you sure?", "Social link will be deleted.",
            "Delete", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/socialLinks/" + id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = this.state.data.filter(item => item.id !== id);
                    this.setState({data});
                    toastSuccess("Social link deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };

}

export default SocialLinksSettings;