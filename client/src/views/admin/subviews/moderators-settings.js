import React, {useContext, useEffect, useState} from 'react';
import {Button, Col} from "react-bootstrap";
import axios from "axios";
import {prettifyEnum, toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import ModeratorInvitationModal from "components/modal/moderator-invitation-modal";
import copy from "copy-text-to-clipboard";
import AdminSidebar from "components/sidebar/admin-sidebar";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import DeleteButton from "components/util/delete-button";
import ViewBox from "components/viewbox/view-box";
import PageBadge from "components/app/page-badge";
import BoardContext from "context/board-context";
import tinycolor from "tinycolor2";
import {PageAvatar} from "components/app/page-avatar";

const ModeratorsSettings = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const [moderators, setModerators] = useState(boardData.moderators);
    const [invited, setInvited] = useState({data: [], loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const getQuota = () => 10 - (boardData.moderators.length + invited.data.length);
    useEffect(() => {
        axios.get("/boards/" + boardData.discriminator + "/invitedModerators").then(res => {
            if (res.status !== 200) {
                setInvited({...invited, error: true});
                return;
            }
            setInvited({...invited, data: res.data, loaded: true});
        }).catch(() => setInvited({...invited, error: true}));
        // eslint-disable-next-line
    }, []);
    const renderOverview = () => {
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
    };
    const renderModerators = () => {
        return <React.Fragment>
            <Col xs={12} sm={6} className="mb-sm-0 mb-3">
                <div className="text-black-60 mb-1">
                    <span className="mr-1">Moderators Quota ({getQuota()} left)</span>
                    <ClickableTip id="quota" title="Moderators Quota" description="Amount of moderators your board can have."/>
                </div>
                {moderators.map((mod, i) => {
                    return <div className="d-inline-flex justify-content-center mr-2" key={i}>
                        <div className="text-center">
                            <PageAvatar roundedCircle url={mod.user.avatar} size={35} username={mod.user.username}/>
                            {renderModerationKick(mod, i)}
                            <br/>
                            <small className="text-truncate d-block" style={{maxWidth: 100}}>{mod.user.username}</small>
                            <PageBadge color={context.getTheme()} text={prettifyEnum(mod.role)} className="move-top-3px"/>
                        </div>
                    </div>
                })}
            </Col>
            <Col xs={12} sm={6}>
                <div className="text-black-60 mb-1">
                    <span className="mr-1">Invited Moderators</span>
                    <ClickableTip id="invited" title="Invited Moderators" description="Moderators that were invited and received invitation email."/>
                </div>
                {invited.data.map((invited, i) => {
                    return <div className="d-inline-flex justify-content-center mr-2" key={i}>
                        <div className="text-center">
                            <PageAvatar roundedCircle url={invited.user.avatar} size={35} username={invited.user.username}/>
                            <DeleteButton id={"invite_del_" + invited.user.id} onClick={() => onInvalidation(invited.id)} tooltipName="Invalidate"/>
                            <br/>
                            <small className="text-truncate d-block" style={{maxWidth: 100}}>{invited.user.username}</small>
                            <div className="cursor-click" onClick={() => {
                                copy(process.env.REACT_APP_SERVER_IP_ADDRESS + "/moderator_invitation/" + invited.code);
                                toastSuccess("Copied to clipboard.");
                            }}><PageBadge color={tinycolor("#0994f6")} text="Copy Invite" className="move-top-3px"/></div>
                        </div>
                    </div>
                })}
            </Col>
            <Col xs={12}>
                <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}}
                        onClick={() => setModalOpen(true)}>Invite New</Button>
            </Col>
        </React.Fragment>
    };
    const renderModerationKick = (mod, i) => {
        if (mod.role.toLowerCase() === "owner") {
            return;
        }
        return <DeleteButton id={"mod_del_" + i} onClick={() => onPermissionsRevoke(mod)}
                             tooltipName="Revoke Permissions"/>;
    };
    const onPermissionsRevoke = (mod) => {
        popupSwal("warning", "Dangerous action", "User will no longer have permissions to moderate this board.",
            "Revoke Permissions", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/boards/" + boardData.discriminator + "/moderators/" + mod.userId).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = moderators.filter(item => item.userId !== mod.userId);
                    setModerators(data);
                    toastSuccess("Permissions revoked.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    const onModInvitationSend = (inviteData) => setInvited({...invited, data: invited.data.concat(inviteData)});
    const onInvalidation = (id) => {
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
                    setInvited({...invited, data: invited.data.filter(item => item.id !== id)});
                    toastSuccess("Invitation removed.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    return <React.Fragment>
        <AdminSidebar currentNode="moderators" reRouteTo={reRouteTo} data={boardData}/>
        <Col xs={12} md={9}>
            <ModeratorInvitationModal onModInvitationSend={onModInvitationSend}
                                      onModInvitationCreateModalClose={() => setModalOpen(false)}
                                      data={boardData} session={context.user.session} open={modalOpen}/>
            <ViewBox theme={context.getTheme()} title="Moderators Management" description="Manage your board moderators here.">
                <React.Fragment>
                    {renderOverview()}
                    {renderModerators()}
                </React.Fragment>
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default ModeratorsSettings;