import axios from "axios";
import ModeratorInviteModal from "components/board/admin/ModeratorInviteModal";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import copy from "copy-text-to-clipboard";
import React, {useContext, useEffect, useState} from 'react';
import tinycolor from "tinycolor2";
import {UiBadge, UiClickableTip} from "ui";
import {UiElementDeleteButton, UiLoadableButton} from "ui/button";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiViewBox} from "ui/viewbox";
import {prettifyEnum, toastError, toastSuccess} from "utils/basic-utils";
import {popupSwal} from "utils/sweetalert-utils";

const ModeratorsSubroute = () => {
    const {data: boardData} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [moderators, setModerators] = useState(boardData.moderators);
    const [invited, setInvited] = useState({data: [], loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const getQuota = () => 10 - (boardData.moderators.length + invited.data.length);
    useEffect(() => {
        setCurrentNode("moderators");
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
            <UiCol xs={12} className={"text-black-60"}>Permissions Overview</UiCol>
            <UiCol xs={12} sm={6} className={"mb-sm-2 mb-3"}>
                <kbd>Owner Permissions</kbd>
                <ul className={"mb-0 pl-3"}>
                    <li>Admin panel access</li>
                    <li>Remove moderators from board</li>
                    <li>All moderator permissions</li>
                </ul>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mb-sm-2 mb-3"}>
                <kbd>Moderator Permissions</kbd>
                <ul className={"mb-0 pl-3"}>
                    <li>Close and Delete Ideas</li>
                    <li>Add and Remove Tags from Ideas</li>
                    <li>Post Internal Comments, Delete Comments</li>
                </ul>
            </UiCol>
        </React.Fragment>
    };
    const renderModerators = () => {
        return <React.Fragment>
            <UiCol xs={12} sm={6} className={"mb-sm-0 mb-3"}>
                <div className={"text-black-60 mb-1"}>
                    <span className={"mr-1"}>Moderators Quota ({getQuota()} left)</span>
                    <UiClickableTip id={"quota"} title={"Moderators Quota"} description={"Amount of moderators your board can have."}/>
                </div>
                {moderators.map((mod, i) => {
                    return <div className={"d-inline-flex justify-content-center mr-2"} key={i}>
                        <div className={"text-center"}>
                            <UiAvatar roundedCircle user={mod.user} size={35}/>
                            {renderModerationKick(mod, i)}
                            <br/>
                            <small className={"text-truncate d-block"} style={{maxWidth: 100}}>{mod.user.username}</small>
                            <UiBadge className={"d-block"}>{prettifyEnum(mod.role)}</UiBadge>
                        </div>
                    </div>
                })}
            </UiCol>
            <UiCol xs={12} sm={6}>
                <div className={"text-black-60 mb-1"}>
                    <span className={"mr-1"}>Invited Moderators</span>
                    <UiClickableTip id={"invited"} title={"Invited Moderators"} description={"Moderators that were invited and received invitation email."}/>
                </div>
                {invited.data.map((invited, i) => {
                    return <div className={"d-inline-flex justify-content-center mr-2"} key={i}>
                        <div className={"text-center"}>
                            <UiAvatar roundedCircle user={invited.user} size={35}/>
                            <UiElementDeleteButton id={"invite_del_" + invited.user.id} onClick={() => onInvalidation(invited.id)} tooltipName={"Invalidate"}/>
                            <br/>
                            <small className={"text-truncate d-block"} style={{maxWidth: 100}}>{invited.user.username}</small>
                            <div className={"cursor-click"} onClick={() => {
                                copy(process.env.REACT_APP_SERVER_IP_ADDRESS + "/moderator_invitation/" + invited.code);
                                toastSuccess("Copied to clipboard.");
                            }}><UiBadge color={tinycolor("#0994f6")} className={"d-block"}>Copy Invite</UiBadge></div>
                        </div>
                    </div>
                })}
            </UiCol>
            <UiCol xs={12}>
                <UiLoadableButton className={"m-0 mt-3 float-right"} onClick={() => {
                    setModalOpen(true);
                    return Promise.resolve();
                }}>Invite New</UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    const renderModerationKick = (mod, i) => {
        if (mod.role.toLowerCase() === "owner") {
            return;
        }
        return <UiElementDeleteButton id={"mod_del_" + i} onClick={() => onPermissionsRevoke(mod)} tooltipName={"Revoke Permissions"}/>;
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
    return <UiCol xs={12} md={9}>
        <ModeratorInviteModal onModInvitationSend={onModInvitationSend} onHide={() => setModalOpen(false)} isOpen={modalOpen}/>
        <UiViewBox title={"Moderators Management"} description={"Manage your board moderators here."}>
            <React.Fragment>
                {renderOverview()}
                {renderModerators()}
            </React.Fragment>
        </UiViewBox>
    </UiCol>
};

export default ModeratorsSubroute;