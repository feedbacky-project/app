import React, {Component} from 'react';
import {Button, Col, OverlayTrigger, Tooltip} from "react-bootstrap";
import axios from "axios";
import {getSizedAvatarByUrl, prettifyEnum, toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import {FaTrashAlt} from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import ModeratorInvitationModal from "components/modal/moderator-invitation-modal";
import copy from "copy-text-to-clipboard";
import AdminSidebar from "components/sidebar/admin-sidebar";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import DeleteButton from "components/util/delete-button";
import ViewBox from "components/viewbox/view-box";

class ModeratorsSettings extends Component {

    static contextType = AppContext;

    state = {
        moderators: this.props.data.moderators,
        invited: {
            data: [],
            loaded: false,
            error: false,
        },
        modalOpened: false,
        quotaReached: this.quotaModeratorsLimitReached(this.props.data.moderators),
    };

    onModInvitationCreateModalClick = () => {
        this.setState({modalOpened: true});
    };

    onModInvitationCreateModalClose = () => {
        this.setState({modalOpened: false});
    };

    componentDidMount() {
        axios.get("/boards/" + this.props.data.discriminator + "/invitedModerators").then(res => {
            if (res.status !== 200) {
                this.setState({
                    invited: {...this.state.invited, error: true}
                });
                return;
            }
            const mods = res.data;
            this.setState({
                invited: {...this.state.invited, data: mods, loaded: true},
                quotaReached: this.quotaModeratorsLimitReached(this.state.quotaReached.concat(mods))
            });
        }).catch(() => this.setState({
            invited: {...this.state.invited, error: true}
        }));
    }

    quotaModeratorsLimitReached(mods) {
        return 10 - mods.length <= 0;
    }

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="moderators" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col xs={12} md={9}>
                <ModeratorInvitationModal onModInvitationSend={this.onModInvitationSend}
                                          onModInvitationCreateModalClose={this.onModInvitationCreateModalClose}
                                          data={this.props.data} session={this.context.user.session}
                                          open={this.state.modalOpened}/>
                <ViewBox theme={this.context.theme} title="Moderators Management" description="Manage your board moderators here.">
                    {this.renderOverview()}
                    {this.renderModerators()}
                </ViewBox>
            </Col>
        </React.Fragment>
    }

    renderOverview() {
        return <React.Fragment>
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
                    <li>Post Internal Comments, Delete Comments</li>
                </ul>
            </Col>
        </React.Fragment>
    }

    renderModerators() {
        return <React.Fragment>
            <Col xs={12} sm={6} className="mb-sm-0 mb-3">
                <div className="text-black-60 mb-1">
                    <span className="mr-1">Moderators Quota ({10 - this.state.moderators.length} left)</span>
                    <ClickableTip id="quota" title="Moderators Quota"
                                  description="Amount of moderators your board can have."/>
                </div>
                {this.state.moderators.map((mod, i) => {
                    return <div className="d-inline-flex justify-content-center mr-2" key={i}>
                        <div className="text-center">
                            <img alt="Moderator" className="rounded-circle" src={mod.user.avatar} height={35}
                                 width={35}/>
                            {this.renderModerationKick(mod, i)}
                            <br/>
                            <small className="text-truncate d-block" style={{maxWidth: 100}}>{mod.user.username}</small>
                            <Badge variant="" className="move-top-3px"
                                   style={{backgroundColor: this.context.theme}}>{prettifyEnum(mod.role)}</Badge>
                        </div>
                    </div>
                })}
            </Col>
            <Col xs={12} sm={6}>
                <div className="text-black-60 mb-1">
                    <span className="mr-1">Invited Moderators</span>
                    <ClickableTip id="invited" title="Invited Moderators"
                                  description="Moderators that were invited and received invitation email."/>
                </div>
                {this.state.invited.data.map((invited, i) => {
                    return <div className="my-1" key={i}>
                        <img className="img-responsive rounded mr-1 m"
                             src={getSizedAvatarByUrl(invited.user.avatar, 32)}
                             onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}
                             alt="avatar"
                             height="24px" width="24px"/>
                        {invited.user.username}
                        {" - "}
                        <a href="#!" className="text-black-60" onClick={() => {
                            copy(process.env.REACT_APP_SERVER_IP_ADDRESS + "/moderator_invitation/" + invited.code);
                            toastSuccess("Copied to clipboard.");
                        }}>Copy Invite</a>
                        <OverlayTrigger overlay={<Tooltip id={"deleteModInvite" + i + "-tooltip"}>Invalidate</Tooltip>}>
                            <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onInvalidation(invited.id)}/>
                        </OverlayTrigger>
                    </div>
                })}
            </Col>
            <Col xs={12}>
                <Button className="text-white m-0 mt-3 float-right" variant="" style={{backgroundColor: this.context.theme}}
                        onClick={this.onModInvitationCreateModalClick}>Invite New</Button>
            </Col>
        </React.Fragment>
    }

    renderModerationKick = (mod, i) => {
        if (mod.role.toLowerCase() === "owner") {
            return;
        }
        return <DeleteButton id={"mod_del_" + i} onClick={() => this.onPermissionsRevoke(mod)}
                             tooltipName="Revoke Permissions"/>;
    };

    onPermissionsRevoke = (mod) => {
        popupSwal("warning", "Dangerous action", "User will no longer have permissions to moderate this board.",
            "Revoke Permissions", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/boards/" + this.props.data.discriminator + "/moderators/" + mod.userId).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const moderators = this.state.moderators.filter(item => item.userId !== mod.userId);
                    this.setState({moderators});
                    toastSuccess("Permissions revoked.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };

    onModInvitationSend = (inviteData) => {
        this.setState({
            invited: {...this.state.invited, data: this.state.invited.data.concat(inviteData)}
        });
    };

    onInvalidation = (id) => {
        popupSwal("warning", "Dangerous action", "User will no longer be able to join the board with this invitation.",
            "Delete Invite", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/moderatorInvitations/" + id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    this.setState({
                        invited: {...this.state.invited, data: this.state.invited.data.filter(item => item.id !== id)}
                    });
                    toastSuccess("Invitation removed.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };

}

export default ModeratorsSettings;