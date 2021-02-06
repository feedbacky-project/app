import axios from "axios";
import ModeratorInviteModal from "components/board/admin/ModeratorInviteModal";
import DangerousActionModal from "components/commons/DangerousActionModal";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import copy from "copy-text-to-clipboard";
import React, {useContext, useEffect, useState} from 'react';
import tinycolor from "tinycolor2";
import {UiBadge, UiClickableTip, UiKeyboardInput} from "ui";
import {UiElementDeleteButton, UiLoadableButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiViewBox} from "ui/viewbox";
import {prettifyEnum, toastError, toastSuccess} from "utils/basic-utils";
import styled from "@emotion/styled";

const InviteCopyButton = styled.div`
  cursor: pointer;
  transition: var(--hover-transition);
  
  &:hover {
    transform: var(--hover-transform-scale);
  }
`;

const ModeratorsSubroute = () => {
    const {data: boardData} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [moderators, setModerators] = useState(boardData.moderators);
    const [invited, setInvited] = useState({data: [], loaded: false, error: false});
    const [modal, setModal] = useState({open: false, type: "", data: ""});
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
                <UiKeyboardInput>Owner Permissions</UiKeyboardInput>
                <ul className={"mb-0 pl-3"}>
                    <li>Admin panel access</li>
                    <li>Remove moderators from board</li>
                    <li>All moderator permissions</li>
                </ul>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mb-sm-2 mb-3"}>
                <UiKeyboardInput>Moderator Permissions</UiKeyboardInput>
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
                <div>
                    <UiFormLabel>Moderators Quota ({getQuota()} left)</UiFormLabel>
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
                <div>
                    <UiFormLabel>Invited Moderators</UiFormLabel>
                    <UiClickableTip id={"invited"} title={"Invited Moderators"} description={"Moderators that were invited and received invitation email."}/>
                </div>
                {invited.data.map((invited, i) => {
                    return <div className={"d-inline-flex justify-content-center mr-2"} key={i}>
                        <div className={"text-center"}>
                            <UiAvatar roundedCircle user={invited.user} size={35}/>
                            <UiElementDeleteButton id={"invite_del_" + invited.user.id} tooltipName={"Invalidate"} onClick={() => setModal({open: true, type: "inviteDelete", data: invited.id})}/>
                            <br/>
                            <small className={"text-truncate d-block"} style={{maxWidth: 100}}>{invited.user.username}</small>
                            <InviteCopyButton onClick={() => {
                                copy(process.env.REACT_APP_SERVER_IP_ADDRESS + "/moderator_invitation/" + invited.code);
                                toastSuccess("Copied to clipboard.");
                            }}><UiBadge color={tinycolor("#0994f6")} className={"d-block"}>Copy Invite</UiBadge></InviteCopyButton>
                        </div>
                    </div>
                })}
            </UiCol>
            <UiCol xs={12}>
                <UiLoadableButton label={"Invite"} className={"mt-3 float-right"} onClick={() => {
                    setModal({...modal, open: true, type: "invite"});
                    return Promise.resolve();
                }}>Invite New</UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    const renderModerationKick = (mod, i) => {
        if (mod.role.toLowerCase() === "owner") {
            return;
        }
        return <UiElementDeleteButton id={"mod_del_" + i} tooltipName={"Revoke Permissions"} onClick={() => setModal({open: true, type: "revoke", data: mod.userId})}/>;
    };
    const onPermissionsRevoke = () => {
        return axios.delete("/boards/" + boardData.discriminator + "/moderators/" + modal.data).then(res => {
            if (res.status !== 204) {
                toastError();
                return;
            }
            const data = moderators.filter(item => item.userId !== modal.data);
            setModerators(data);
            toastSuccess("Permissions revoked.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const onModInvitationSend = (inviteData) => setInvited({...invited, data: invited.data.concat(inviteData)});
    const onInvalidation = () => {
        return axios.delete("/moderatorInvitations/" + modal.data).then(res => {
            if (res.status !== 204) {
                toastError();
                return;
            }
            setInvited({...invited, data: invited.data.filter(item => item.id !== modal.data)});
            toastSuccess("Invitation removed.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    return <UiCol xs={12} md={9}>
        <ModeratorInviteModal onModInvitationSend={onModInvitationSend} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "invite"}/>
        <DangerousActionModal id={"inviteDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "inviteDelete"} onAction={onInvalidation}
                              actionDescription={<div>User won't be able to accept this invitation anymore.</div>}/>
        <DangerousActionModal id={"revokeMod"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "revoke"} onAction={onPermissionsRevoke}
                              actionDescription={<div>User permissions to moderate the board will be <u>revoked</u>.</div>} actionButtonName={"Revoke"}/>
        <UiViewBox title={"Moderators Management"} description={"Manage your board moderators here."}>
            <React.Fragment>
                {renderOverview()}
                {renderModerators()}
            </React.Fragment>
        </UiViewBox>
    </UiCol>
};

export default ModeratorsSubroute;