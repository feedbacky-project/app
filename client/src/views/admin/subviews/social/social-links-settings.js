import React, {Component} from 'react';
import AdminSidebar from "../../../../components/sidebar/admin-sidebar";
import {Button, Col, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import axios from "axios";
import {getSimpleRequestConfig, toastError, toastSuccess} from "../../../../components/util/utils";
import AppContext from "../../../../context/app-context";
import LoadingSpinner from "../../../../components/util/loading-spinner";
import {FaTrashAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import {popupSwal} from "../../../../components/util/sweetalert-utils";

class SocialLinksSettings extends Component {

    static contextType = AppContext;

    state = {
        data: [],
        loaded: false,
        error: false,
    };

    componentDidMount() {
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/socialLinks", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({error: true});
                return;
            }
            const links = res.data;
            this.setState({data: links, loaded: true});
        }).catch(() => {
            this.setState({error: true});
        });
    }

    calculateLeft() {
        return 4 - this.state.data.length;
    }

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="social" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col xs={12} md={9} className="mt-4">
                <h2 className="h2-responsive mb-3">Social Links</h2>
                {this.renderContent()}
            </Col>
        </React.Fragment>
    }

    renderContent() {
        if (this.state.error) {
            return <span className="text-danger">Failed to obtain social links data</span>
        }
        if (!this.state.loaded) {
            return <Row className="mt-4 ml-2"><LoadingSpinner/></Row>
        }
        return <Col className="mb-3">
            <Row className="py-4 px-sm-2 px-0 rounded-top box-overlay">
                <Col xs={12} className="mb-sm-0 mb-3">
                    <div className="text-black-60">Current Social Links ({this.calculateLeft()} left)</div>
                    {this.state.data.map((link) => {
                        return <div className="mr-2" key={"boardLink_" + link.id}>
                            <img className="bg-dark p-2 mr-2" alt="Logo" src={link.logoUrl} height={32} width={32}/>
                            {this.truncateUrl(link.url)}
                            <OverlayTrigger overlay={<Tooltip id={"deleteSocial" + link.id + "-tooltip"}>Delete</Tooltip>}>
                                <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onSocialLinkDelete(link.id)}/>
                            </OverlayTrigger>
                        </div>
                    })}
                    {this.renderAddButton()}
                </Col>
            </Row>
        </Col>
    }

    renderAddButton() {
        if (this.calculateLeft() <= 0) {
            return <React.Fragment/>
        }
        return <Button className="btn-smaller text-white m-0 mt-3" variant="" style={{backgroundColor: this.context.theme}} as={Link} to={"/ba/" + this.props.data.discriminator + "/social/create"}>Add New</Button>
    }

    truncateUrl(url) {
        return url.replace("https://", "").replace("http://", "").replace("www.", "");
    }

    onSocialLinkDelete = (id) => {
        popupSwal("question", "Are you sure?", "Social link will be deleted.",
            "Delete", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/socialLinks/" + id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = this.state.data.filter(item => item.id !== id);
                    this.setState({data});
                    toastSuccess("Social link deleted.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

}

export default SocialLinksSettings;