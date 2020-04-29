import React, {Component} from 'react';
import AppContext from "../../../context/app-context";
import {Button, Col, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import axios from "axios";
import LoadingSpinner from "../../../components/util/loading-spinner";
import {FaTrashAlt} from "react-icons/fa";
import {getSimpleRequestConfig, getSizedAvatarByUrl, toastError, toastSuccess} from "../../../components/util/utils";
import InvitationModal from "../../../components/modal/invitation-modal";
import copy from "copy-text-to-clipboard";
import AdminSidebar from "../../../components/sidebar/admin-sidebar";
import {popupSwal} from "../../../components/util/sweetalert-utils";
import ClickableTip from "../../../components/util/clickable-tip";

class InvitationsSettings extends Component {

    static contextType = AppContext;

    state = {
        data: [],
        loaded: false,
        error: false,
        modalOpened: false,
        invitedData: [],
        invitedLoaded: false,
        invitedError: false,
    };

    onInvitationCreateModalClick = () => {
        this.setState({modalOpened: true});
    };

    onInvitationCreateModalClose = () => {
        this.setState({modalOpened: false});
    };

    componentDidMount() {
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/invitations", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({error: true});
                return;
            }
            const data = res.data;
            this.setState({data, loaded: true});
        }).catch(() => this.setState({error: true}));
        axios.get(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/invitedUsers", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                this.setState({invitedError: true});
                return;
            }
            const invitedData = res.data;
            this.setState({invitedData, invitedLoaded: true});
        }).catch(() => this.setState({invitedError: true}));
    }

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="invitations" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col className="mt-4">
                <h2 className="h2-responsive mb-3">Invitations</h2>
                {this.renderContent()}
            </Col>
        </React.Fragment>
    }

    renderContent() {
        if (!this.props.data.privatePage) {
            return <Col className="mb-3 px-0">
                <h2 className="h2-responsive text-danger">Feature Disabled</h2>
                <span><kbd>Private Board</kbd> option is disabled so you can't manage board invitations.
                    <br/>Enable it in <kbd>General</kbd> section to manage pending invitations and invited users.
                </span>
            </Col>
        }
        if (this.state.error) {
            return <span className="text-danger">Failed to obtain invitations data</span>
        }
        if (!this.state.loaded) {
            return <Row className="mt-4 ml-2"><LoadingSpinner/></Row>
        }
        return <React.Fragment>
            <InvitationModal onInvitationSend={this.onInvitationSend} onInvitationCreateModalClose={this.onInvitationCreateModalClose} data={this.props.data} session={this.context.user.session} open={this.state.modalOpened}/>
            <Row className="m-0 p-4 rounded box-overlay">
                <Col sm={6} className="px-1 mb-sm-0 mb-4">
                    <span className="mr-1 text-black-60">Pending Invitations</span>
                    <ClickableTip id="invitePending" title="Pending Invitations" description="Users whose invitations were not yet accepted."/>
                    {this.renderInvitations()}
                    <div>
                        <Button className="btn-smaller text-white m-0 mt-3" variant="" style={{backgroundColor: this.context.theme}} onClick={this.onInvitationCreateModalClick}>Invite New</Button>
                    </div>
                </Col>
                <Col sm={6} className="px-1">
                    <span className="mr-1 text-black-60">Invited Members</span>
                    <ClickableTip id="invited" title="Invited Members" description="Users who accepted invitation and can see your board. Can be kicked any time."/>
                    {this.renderInvited()}
                </Col>
            </Row>
        </React.Fragment>
    }

    renderInvitations() {
        return this.state.data.map((invite, i) => {
            return <div className="my-1" key={i}>
                <img className="img-responsive rounded mr-1 m"
                     src={getSizedAvatarByUrl(invite.user.avatar, 32)}
                     onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}
                     alt="avatar"
                     height="24px" width="24px"/>
                {invite.user.username}
                {" - "}
                <a href="#!" className="text-black-60" onClick={() => {
                    copy(process.env.REACT_APP_SERVER_IP_ADDRESS + "/invitation/" + invite.code);
                    toastSuccess("Copied to clipboard.")
                }}>Copy Invite</a>
                <OverlayTrigger overlay={<Tooltip id={"deleteInvite" + i + "-tooltip"}>Invalidate</Tooltip>}>
                    <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onInvalidation(invite.id)}/>
                </OverlayTrigger>
            </div>
        });
    }

    renderInvited() {
        return this.state.invitedData.map((user, i) => {
            return <div className="my-1" key={i}>
                <img className="img-responsive rounded mr-1"
                     src={getSizedAvatarByUrl(user.avatar, 32)}
                     onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}
                     alt="avatar"
                     height="24px" width="24px"/>
                {user.username}
                <OverlayTrigger overlay={<Tooltip id={"deleteInvite" + i + "-tooltip"}>Kick Out from Board</Tooltip>}>
                    <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onKick(user.id)}/>
                </OverlayTrigger>
            </div>
        });
    }

    onKick = (id) => {
        popupSwal("warning", "Dangerous action", "User will no longer be able to see this board.",
            "Delete Invite", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/invitedUsers/" + id, getSimpleRequestConfig(this.context.user.session)).then(res => {
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

    onInvitationSend = (inviteData) => {
        const data = this.state.data.concat(inviteData);
        this.setState({data});
    };

    onInvalidation = (id) => {
        popupSwal("warning", "Dangerous action", "User will no longer be able to join the board with this invitation.",
            "Delete Invite", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/invitations/" + id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = this.state.data.filter(item => item.id !== id);
                    this.setState({data});
                    toastSuccess("Invitation removed.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

}

export default InvitationsSettings;