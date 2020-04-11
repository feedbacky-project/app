import React, {Component} from 'react';
import {Button, Col, OverlayTrigger, Popover, Row, Tooltip} from "react-bootstrap";
import axios from "axios";
import {getSimpleRequestConfig, getSizedAvatarByUrl, toastError, toastSuccess} from "../../../components/util/Utils";
import AppContext from "../../../context/AppContext";
import {FaQuestionCircle, FaTrashAlt} from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import ModInvitationModal from "../../../components/modal/ModInvitationModal";
import copy from "copy-text-to-clipboard";
import AdminSidebar from "../../../components/sidebar/AdminSidebar";
import {popupSwal} from "../../../components/util/SwalUtils";
import {FaTimes} from "react-icons/all";

class ModeratorsSettings extends Component {

    static contextType = AppContext;

    state = {
        data: [],
        loaded: false,
        error: false,
        invitedData: [],
        invitedLoaded: false,
        invitedError: false,
        modalOpened: false,
        quotaReached: false,
    };

    onModInvitationCreateModalClick = () => {
        this.setState({modalOpened: true});
    };

    onModInvitationCreateModalClose = () => {
        this.setState({modalOpened: false});
    };

    componentDidMount() {
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/moderators", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({error: true});
                return;
            }
            const mods = res.data;
            let quotaReached = this.quotaModeratorsLimitReached(mods);
            this.setState({data: mods, loaded: true, quotaReached});
        }).catch(() => {
            this.setState({error: true});
        });
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/invitedModerators", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({invitedError: true});
                return;
            }
            const mods = res.data;
            let quotaReached = this.quotaModeratorsLimitReached(mods);
            this.setState({invitedData: mods, invitedLoaded: true, quotaReached});
        }).catch(() => {
            this.setState({invitedError: true});
        });
    }

    quotaModeratorsLimitReached(mods) {
        return 10 - mods.length <= 0;
    }

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="moderators" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col xs={12} md={9} className="mt-4">
                <h2 className="h2-responsive mb-3">Moderators Management</h2>
                <Row className="m-0 p-4 rounded box-overlay">
                    {this.renderOverview()}
                    {this.renderModerators()}
                </Row>
            </Col>
        </React.Fragment>
    }

    renderOverview() {
        return <React.Fragment>
            <ModInvitationModal onModInvitationSend={this.onModInvitationSend} onModInvitationCreateModalClose={this.onModInvitationCreateModalClose} data={this.props.data} session={this.context.user.session} open={this.state.modalOpened}/>
            <span className="col-12 text-black-60">Permissions Overview</span>
            <Col xs={12} sm={6} className="mb-sm-2 mb-3">
                <kbd>Owner Permissions</kbd>
                <ul className="mb-0 pl-3">
                    <li>Admin panel access</li>
                    <li>Remove moderators from board</li>
                    <li>All moderator permissions</li>
                </ul>
            </Col>
            <Col xs={12} sm={6} className="mb-sm-2 mb-3">
                <kbd>Moderator Permissions</kbd>
                <ul className="mb-0 pl-3">
                    <li>Close and Delete Ideas</li>
                    <li>Add and Remove Tags from Ideas</li>
                    <li>Delete Comments</li>
                </ul>
            </Col>
        </React.Fragment>
    }

    renderModerators() {
        return <React.Fragment>
            <Col xs={12} sm={6} className="mb-sm-0 mb-3">
                <div className="text-black-60 mb-1">
                    Moderators Quota ({10 - this.state.data.length} left)
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="moderatorsQuota">
                                <Popover.Title as="h3">Moderators Quota</Popover.Title>
                                <Popover.Content>
                                    Amount of moderators your board can have.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="ml-1 fa-xs text-black-50"/>
                    </OverlayTrigger>
                </div>
                {this.state.data.map((mod, i) => {
                    return <div className="d-inline-flex justify-content-center mr-2" key={"boardMod_" + i}>
                        <div className="text-center">
                            <img alt="Moderator" className="rounded-circle" src={mod.user.avatar} height={35} width={35}/>
                            {this.renderModerationKick(mod, i)}
                            <br/>
                            <small className="text-truncate d-block" style={{maxWidth: 100}}>{mod.user.username}</small>
                            {this.renderModerationBadge(mod)}
                        </div>
                    </div>
                })}
                <div>
                    <Button className="btn-smaller text-white m-0 mt-3" variant="" style={{backgroundColor: this.context.theme}} onClick={this.onModInvitationCreateModalClick}>Invite New</Button>
                </div>
            </Col>
            <Col xs={12} sm={6}>
                <div className="text-black-60 mb-1">
                    Invited Moderators
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="moderatorsQuota">
                                <Popover.Title as="h3">Invited Moderators</Popover.Title>
                                <Popover.Content>
                                    Moderators that were invited and received invitation email.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="ml-1 fa-xs text-black-50"/>
                    </OverlayTrigger>
                </div>
                {this.state.invitedData.map((invited, i) => {
                    return <div className="my-1" key={i}>
                        <img className="img-responsive rounded mr-1 m"
                             src={getSizedAvatarByUrl(invited.user.avatar, 32)}
                             onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}
                             alt="avatar"
                             height="24px" width="24px"/>
                        {invited.user.username}
                        {" - "}
                        <a href="#!" className="text-black-60" onClick={() => {
                            copy("https://app.feedbacky.net/moderator_invitation/" + invited.code);
                            toastSuccess("Copied to clipboard.");
                        }}>Copy Invite</a>
                        <OverlayTrigger overlay={<Tooltip id={"deleteModInvite" + i + "-tooltip"}>Invalidate</Tooltip>}>
                            <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onInvalidation(invited.id)}/>
                        </OverlayTrigger>
                    </div>
                })}
            </Col>
        </React.Fragment>
    }

    renderModerationKick = (mod, i) => {
        if (mod.role.toLowerCase() === "owner") {
            return;
        }
        return <OverlayTrigger overlay={<Tooltip id={"revokeInviteMod" + i + "-tooltip"}>Revoke Permissions</Tooltip>}>
            <FaTimes className="grey lighten-2 black-text rounded-circle" onClick={() => this.onPermissionsRevoke(mod)} style={{position: "absolute", transform: "translate(-6px,-6px)"}}/>
        </OverlayTrigger>;
    };

    renderModerationBadge = (mod) => {
        switch (mod.role.toLowerCase()) {
            case "owner":
                return <Badge variant="primary" className="move-top-3px">Owner</Badge>;
            case "moderator":
                return <Badge variant="warning" className="move-top-3px">Mod</Badge>;
            default:
                return <React.Fragment/>;
        }
    };

    onPermissionsRevoke = (mod) => {
        popupSwal("warning", "Dangerous action", "User will no longer have permissions to moderate this board.",
            "Revoke Permissions", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/moderators/" + mod.userId, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = this.state.data.filter(item => item.userId !== mod.userId);
                    this.setState({data});
                    toastSuccess("Permissions revoked.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

    onModInvitationSend = (inviteData) => {
        const invitedData = this.state.invitedData.concat(inviteData);
        this.setState({invitedData});
    };

    onInvalidation = (id) => {
        popupSwal("warning", "Dangerous action", "User will no longer be able to join the board with this invitation.",
            "Delete Invite", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/moderatorInvitations/" + id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const invitedData = this.state.invitedData.filter(item => item.id !== id);
                    this.setState({invitedData});
                    toastSuccess("Invitation removed.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

}

export default ModeratorsSettings;