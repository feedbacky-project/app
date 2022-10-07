import styled from "@emotion/styled";
import axios from "axios";
import ModeratorInviteModal from "components/board/admin/ModeratorInviteModal";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import {BoardContext, PageNodesContext} from "context";
import copy from "copy-text-to-clipboard";
import React, {useContext, useEffect, useState} from 'react';
import {FaTrash} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiBadge, UiClickableTip, UiKeyboardInput, UiThemeContext} from "ui";
import {UiElementDeleteButton, UiLoadableButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiViewBox} from "ui/viewbox";
import {popupError, popupNotification, prettifyEnum} from "utils/basic-utils";
import {getEnvVar} from "utils/env-vars";
import {useTitle} from "utils/use-title";

const ClickableButton = styled.div`
  cursor: pointer;
  transition: var(--hover-transition);

  &:hover {
    background-color: ${props => props.theme} !important;
  }
`;

const Moderator = styled.div`
  display: inline-flex;
  justify-content: center;
  margin: .5em;
`;

const ModeratorsSubroute = () => {
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData, updateState} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [moderators, setModerators] = useState(boardData.moderators);
    const [invited, setInvited] = useState({data: [], loaded: false, error: false});
    const [modal, setModal] = useState({open: false, type: "", data: ""});
    useEffect(() => setModerators(boardData.moderators), [boardData.moderators]);
    useTitle(boardData.name + " | Moderators");
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
            <UiFormLabel as={UiCol} xs={12} className={"mb-0"}>Permissions Overview</UiFormLabel>
            <UiCol xs={12} sm={6} className={"mb-sm-2 mb-3"}>
                <UiKeyboardInput>Owner & Administrator Permissions</UiKeyboardInput>
                <ul className={"mb-0 pl-3"}>
                    <li>Delete Board <UiKeyboardInput>Owner Only</UiKeyboardInput></li>
                    <li>Promote and Demote Moderators <UiKeyboardInput>Owner Only</UiKeyboardInput></li>
                    <li>Admin Panel Access</li>
                    <li>Invite Moderators to Board</li>
                    <li>Remove Moderators from Board</li>
                    <li>Remove Suspended Users</li>
                    <li>All Moderator Permissions</li>
                </ul>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mb-sm-2 mb-3"}>
                <UiKeyboardInput>Moderator Permissions</UiKeyboardInput>
                <ul className={"mb-0 pl-3"}>
                    <li>Close and Delete Ideas</li>
                    <li>Add and Remove Tags from Ideas</li>
                    <li>Post Internal Comments</li>
                    <li>Delete Comments</li>
                    <li>Enable and Disable Commenting</li>
                    <li>Suspend Users, Assign Mods to Ideas</li>
                    <li>Edit Ideas' Titles</li>
                </ul>
            </UiCol>
        </React.Fragment>
    };
    const renderModerators = () => {
        return <React.Fragment>
            <UiCol xs={12} sm={6} className={"mb-sm-0 mb-3"}>
                <div>
                    <UiFormLabel>Active Moderators</UiFormLabel>
                </div>
                {moderators.map((mod, i) => {
                    return <Moderator key={i}>
                        <div className={"text-center"}>
                            <UiAvatar roundedCircle user={mod.user} size={35}/>
                            {renderModerationKick(mod, i)}
                            <br/>
                            <small className={"text-truncate d-block"} style={{maxWidth: 100}}>{mod.user.username}</small>
                            <UiBadge className={"d-block"}>{prettifyEnum(mod.role)}</UiBadge>
                            {renderPromoteBadge(mod)}
                        </div>
                    </Moderator>
                })}
            </UiCol>
            <UiCol xs={12} sm={6}>
                <div>
                    <UiFormLabel>Invited Moderators</UiFormLabel>
                    <UiClickableTip id={"invited"} title={"Invited Moderators"} description={"Moderators that were invited and received invitation email."}/>
                </div>
                {invited.data.map((invited, i) => {
                    const onDelete = () => setModal({open: true, type: "inviteDelete", data: invited.id});
                    return <Moderator key={i}>
                        <div className={"text-center"}>
                            <UiAvatar roundedCircle user={invited.user} size={35}/>
                            <UiElementDeleteButton id={"invite_del_" + invited.user.id} tooltipName={"Invalidate"} onClick={onDelete}/>
                            <br/>
                            <small className={"text-truncate d-block"} style={{maxWidth: 100}}>{invited.user.username}</small>
                            <ClickableButton theme={tinycolor("#0994f6").setAlpha(.5).toString()} onClick={() => {
                                copy(getEnvVar("REACT_APP_SERVER_IP_ADDRESS") + "/moderator_invitation/" + invited.code);
                                popupNotification("Copied", getTheme());
                            }}><UiBadge color={tinycolor("#0994f6")} className={"d-block"}>Copy Invite</UiBadge></ClickableButton>
                        </div>
                    </Moderator>
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
    const renderPromoteBadge = (mod) => {
        if (mod.role.toLowerCase() === "owner") {
            return;
        }
        if (mod.role.toLowerCase() === "moderator") {
            return <ClickableButton as={UiBadge} color={tinycolor("#00c851")} theme={tinycolor("#00c851").setAlpha(.5).toString()} className={"d-block my-1"}
                                    onClick={() => setModal({open: true, type: "promote", data: mod.userId})}>Promote</ClickableButton>
        } else {
            return <ClickableButton as={UiBadge} color={tinycolor("#ff3547")} theme={tinycolor("#ff3547").setAlpha(.5).toString()} className={"d-block my-1"}
                                    onClick={() => setModal({open: true, type: "demote", data: mod.userId})}>Demote</ClickableButton>
        }
    };
    const onPermissionsRevoke = () => {
        return axios.delete("/boards/" + boardData.discriminator + "/moderators/" + modal.data).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            const data = moderators.filter(item => item.userId !== modal.data);
            setModerators(data);
            popupNotification("Permissions revoked", getTheme());
        });
    };
    const onModInvitationSend = (inviteData) => setInvited({...invited, data: invited.data.concat(inviteData)});
    const onInvalidation = () => {
        return axios.delete("/moderatorInvitations/" + modal.data).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            setInvited({...invited, data: invited.data.filter(item => item.id !== modal.data)});
            popupNotification("Invitation removed", getTheme());
        });
    };
    const onRoleChange = newRole => {
        return axios.patch("/boards/" + boardData.discriminator + "/moderators", {
            userId: modal.data, role: newRole
        }).then(res => {
            const updated = moderators.map(mod => mod.userId === modal.data ? {...mod, role: res.data.role} : mod);
            updateState({...boardData, moderators: updated});
            popupNotification("Changed role to " + newRole, getTheme());
        });
    };
    return <UiCol xs={12}>
        <ModeratorInviteModal onModInvitationSend={onModInvitationSend} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "invite"}/>
        <DangerousActionModal id={"inviteDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "inviteDelete"} onAction={onInvalidation}
                              actionDescription={<div>User won't be able to accept this invitation anymore.</div>} Icon={FaTrash}/>
        <DangerousActionModal id={"revokeMod"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "revoke"} onAction={onPermissionsRevoke}
                              actionDescription={<div>User permissions to moderate the board will be <u>revoked</u>.</div>} actionButtonName={"Revoke"}/>
        <DangerousActionModal id={"promoteMod"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "promote"} onAction={() => onRoleChange("administrator")}
                              actionDescription={<div>Moderator will be promoted to administrator and will gain additional privileges.</div>} actionButtonName={"Promote"}/>
        <DangerousActionModal id={"demoteAdm"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "demote"} onAction={() => onRoleChange("moderator")}
                              actionDescription={<div>Administrator will be demoted to moderator and will lose additional privileges.</div>} actionButtonName={"Demote"}/>
        <UiViewBox title={"Moderators Management"} description={"Manage your board moderators here."}>
            <React.Fragment>
                {renderOverview()}
                {renderModerators()}
            </React.Fragment>
        </UiViewBox>
    </UiCol>
};

export default ModeratorsSubroute;