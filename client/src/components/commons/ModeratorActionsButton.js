import styled from "@emotion/styled";
import axios from "axios";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import ModeratorAssignUpdateModal from "components/commons/modal/ModeratorAssignUpdateModal";
import ModeratorTagsUpdateModal from "components/commons/modal/ModeratorTagsUpdateModal";
import ModeratorVotesResetModal from "components/commons/modal/ModeratorVotesResetModal";
import TitleEditModal from "components/commons/modal/TitleEditModal";
import {AppContext, BoardContext, IdeaContext} from "context";
import PropTypes from "prop-types";
import React, {useContext, useState} from 'react';
import {FaCog, FaComment, FaCommentSlash, FaGithub, FaICursor, FaLink, FaLock, FaTags, FaTrash, FaUnlink, FaUnlock, FaUserCheck, FaUserLock} from "react-icons/fa";
import {useHistory} from "react-router-dom";
import {UiKeyboardInput, UiThemeContext} from "ui";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";
import {popupError, popupNotification, popupRevertableNotification, popupWarning} from "utils/basic-utils";

export const IconToggle = styled(FaCog)`
  transition: all 0.7s ease-in-out 0s;
  color: var(--pure-dark-half);
  
  //hide non-essential motion if requested
  @media(prefers-reduced-motion: no-preference) {
      &:hover {
        color: var(--pure-dark-half);
        transform: rotate(360deg);
        transition: all 0.7s ease-in-out 0s;
      }
  }
  
  .dark &, .dark &:hover {
    color: hsla(0, 0%, 95%, .5);
  }
`;

export const DropdownOption = styled(UiDropdownElement)`
  cursor: pointer;
`;

const ActionIcon = styled.span`
  margin-right: .25em;
  transform: translateY(-2px);
  color: ${props => props.color};
`;

const ModeratorActionsButton = ({onIdeaDelete = () => void 0, onStateChange = () => void 0}) => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData, updateState: updateBoardState} = useContext(BoardContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const [modal, setModal] = useState({open: false, type: ""});
    const history = useHistory();
    const visible = boardData.moderators.find(mod => mod.userId === user.data.id);

    const doIdeaStateChange = (state, value, message, revertMessage, isRevert = false) => {
        return axios.patch("/ideas/" + ideaData.id, {[state]: value}).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            updateState({...ideaData, [state]: value});
            let finalMessage = message;
            if (isRevert) {
                finalMessage = revertMessage;
            }
            popupRevertableNotification(finalMessage, getTheme(), () => doIdeaStateChange(state, !value, message, revertMessage, !isRevert));
            onStateChange("discussion");
        });
    };
    const doIdeaDelete = () => {
        return axios.delete("/ideas/" + ideaData.id).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            popupNotification("Idea deleted", getTheme());
            history.push("/b/" + ideaData.boardDiscriminator);
            onIdeaDelete();
        });
    };
    const doSuspendUser = () => {
        //todo finite suspension dates
        const date = new Date();
        return axios.post("/boards/" + boardData.discriminator + "/suspendedUsers", {
            userId: ideaData.user.id,
            suspensionEndDate: (date.getFullYear() + 10) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
        }).then(res => {
            if (res.status !== 201) {
                popupWarning("Failed to suspend the user");
                return;
            }
            popupNotification("User suspended", getTheme());
            updateBoardState({...boardData, suspendedUsers: boardData.suspendedUsers.concat(res.data)});
        });
    };
    const onTitleEdit = (title) => {
        return axios.patch("/ideas/" + ideaData.id, {
            title
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            updateState({...ideaData, ...res.data});
            popupNotification("Title updated", getTheme());
            onStateChange("discussion");
        });
    }
    const onTagsManage = (appliedTags) => {
        let data = [];
        boardData.tags.forEach(tag => {
            data.push({name: tag.name, apply: appliedTags.some(d => d.name === tag.name)});
        });
        return axios.patch("/ideas/" + ideaData.id + "/tags", data).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            updateState({...ideaData, tags: res.data});
            popupNotification("Tags updated", getTheme());
            onStateChange("discussion");
        });
    };
    const onModeratorAssign = (assignees) => {
        return axios.patch("/ideas/" + ideaData.id, {assignees: assignees.map(a => a.id)}).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            updateState({...ideaData, assignees: res.data.assignees});
            popupNotification("Assignees updated", getTheme());
            onStateChange("discussion");
        });
    };
    const onGitHubIdeaConvert = () => {
        return axios.patch("/ideas/" + ideaData.id + "/github/convert", {}).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            popupNotification("Converted to GitHub issue", getTheme());
            onStateChange("discussion");
        });
    }
    const onVotesReset = (type) => {
        return axios.patch("/ideas/" + ideaData.id + "/voters", {clearType: type}).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            updateState({...ideaData, votersAmount: res.data.length, upvoted: type === "ALL" ? false : ideaData.upvoted});
            popupNotification("Votes reset", getTheme());
            onStateChange("both");
        });
    };
    const isGitHubButtonAvailable = () => {
        const integration = boardData.integrations.filter(i => i.integrationType === "GITHUB")[0];
        if (integration === undefined || integration.data === {} || !integration.data.enabled
            || ideaData.metadata.integration_github_issue_number) {
            return false;
        }
        return true;
    }
    const getGitHubIntegrationRepository = () => {
        const integration = boardData.integrations.filter(i => i.integrationType === "GITHUB")[0];
        if (integration === undefined || integration.data === {} || !integration.data.enabled) {
            return "";
        }
        return integration.data.repository;
    };
    const isSuspendable = () => {
        if (boardData.moderators.find(mod => mod.user.id === ideaData.user.id)) {
            return false;
        }
        return !boardData.suspendedUsers.find(suspended => suspended.user.id === ideaData.user.id);
    };

    if (!visible) {
        return <React.Fragment/>;
    }
    let color = getTheme();
    if (user.darkMode) {
        color = color.setAlpha(.8);
    }
    const hide = () => setModal({...modal, open: false});
    const onTabIndex = e => {
        if(document.activeElement !== e.target || e.which !== 13) {
            return;
        }
        e.preventDefault();
        e.target.click();
    };
    return <UiDropdown dataIdMenu={"moderation-menu"} dataIdToggle={"moderation-toggle"} label={"Moderate Idea"} className={"d-inline mx-1"} toggleClassName={"text-black-60 p-0"} toggle={<IconToggle className={"align-baseline"}/>}>
        <DangerousActionModal id={"close"} onHide={hide} isOpen={modal.open && modal.type === "close"} Icon={FaLock}
                              onAction={() => doIdeaStateChange("open", false, "Idea closed.", "Idea opened.")}
                              actionDescription={<div>Once you close idea you can open it again.</div>} actionButtonName={"Close"}/>
        <DangerousActionModal id={"open"} onHide={hide} isOpen={modal.open && modal.type === "open"} Icon={FaUnlock}
                              onAction={() => doIdeaStateChange("open", true, "Idea opened.", "Idea closed.")}
                              actionDescription={<div>Once you reopen idea you can close it again.</div>} actionButtonName={"Open"}/>
        <DangerousActionModal id={"delete"} onHide={hide} isOpen={modal.open && modal.type === "delete"} onAction={doIdeaDelete} Icon={FaTrash}
                              actionDescription={<div>Idea with <strong className={"text-red"}>{ideaData.votersAmount} Voters</strong> and <strong className={"text-red"}>{ideaData.commentsAmount} Comments</strong> will be permanently <u>deleted</u>.</div>}/>
        <DangerousActionModal id={"suspend"} onHide={hide} isOpen={modal.open && modal.type === "suspend"} onAction={doSuspendUser} actionButtonName={"Suspend"} Icon={FaUserLock}
                              actionDescription={<div>Suspended users cannot post new ideas and upvote/downvote ideas unless unsuspended through board admin panel.</div>}/>
        <DangerousActionModal id={"github_convert"} onHide={hide} isOpen={modal.open && modal.type === "github_convert"} onAction={onGitHubIdeaConvert} actionButtonName={"Convert"}
                              actionDescription={<div>This idea will be converted into an issue located at <UiKeyboardInput className={"d-inline-block"}>{getGitHubIntegrationRepository()}</UiKeyboardInput> repository.</div>}/>
        <DangerousActionModal id={"enable_comments"} onHide={hide} isOpen={modal.open && modal.type === "enable_comments"} Icon={FaComment}
                              onAction={() => doIdeaStateChange("commentingRestricted", false, "Commenting enabled.", "Commenting disabled.")}
                              actionDescription={<div>Everyone will be able to comment this idea.</div>} actionButtonName={"Enable"}/>
        <DangerousActionModal id={"restrict_comments"} onHide={hide} isOpen={modal.open && modal.type === "restrict_comments"} Icon={FaCommentSlash}
                              onAction={() => doIdeaStateChange("commentingRestricted", true, "Commenting disabled.", "Commenting enabled.")}
                              actionDescription={<div>Only moderators will be able to comment this idea.</div>} actionButtonName={"Disable"}/>
        <DangerousActionModal id={"unpin"} onHide={hide} isOpen={modal.open && modal.type === "unpin"} Icon={FaUnlink}
                              onAction={() => doIdeaStateChange("pinned", false, "Idea unpinned.", "Idea pinned.")}
                              actionDescription={<div>Idea will no longer be pinned at the top of ideas list.</div>} actionButtonName={"Unpin"}/>
        <DangerousActionModal id={"pin"} onHide={hide} isOpen={modal.open && modal.type === "pin"} Icon={FaLink}
                              onAction={() => doIdeaStateChange("pinned", true, "Idea pinned.", "Idea unpinned.")}
                              actionDescription={<div>Idea will be pinned at the top of ideas list.</div>} actionButtonName={"Pin"}/>
        <ModeratorTagsUpdateModal onHide={hide} isOpen={modal.open && modal.type === "tags"} onAction={onTagsManage}/>
        <ModeratorAssignUpdateModal onHide={hide} isOpen={modal.open && modal.type === "assign"} onAction={onModeratorAssign}/>
        <ModeratorVotesResetModal onHide={hide} isOpen={modal.open && modal.type === "votes_reset"} onAction={onVotesReset}/>
        <TitleEditModal onHide={hide} isOpen={modal.open && modal.type === "title_edit"} onAction={onTitleEdit}/>
        <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "title_edit"})} as={"span"}><ActionIcon as={FaICursor} color={color}/> Edit Title</DropdownOption>
        <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "tags"})} as={"span"}><ActionIcon as={FaTags} color={color}/> Change Tags</DropdownOption>
        <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "assign"})} as={"span"}><ActionIcon as={FaUserCheck} color={color}/> Assign Moderator</DropdownOption>
        {ideaData.open ?
            <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "close"})} as={"span"}><ActionIcon as={FaLock} color={color}/> Close Idea</DropdownOption> :
            <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "open"})} as={"span"}><ActionIcon as={FaUnlock} color={color}/> Open Idea</DropdownOption>
        }
        <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "delete"})} as={"span"}><ActionIcon as={FaTrash} color={color}/> Delete Idea</DropdownOption>
        {ideaData.commentingRestricted ?
            <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "enable_comments"})} as={"span"}><ActionIcon as={FaComment} color={color}/> Enable Comments</DropdownOption> :
            <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "restrict_comments"})} as={"span"}><ActionIcon as={FaCommentSlash} color={color}/> Disable Comments</DropdownOption>
        }
        {ideaData.pinned ?
            <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "unpin"})} as={"span"}><ActionIcon as={FaUnlink} color={color}/> Unpin Idea</DropdownOption> :
            <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "pin"})} as={"span"}><ActionIcon as={FaLink} color={color}/> Pin Idea</DropdownOption>
        }
        <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => {
            setModal({open: true, type: "votes_reset"})
        }} as={"span"}><ActionIcon as={FaTags} color={color}/> Reset Votes</DropdownOption>
        {isGitHubButtonAvailable() && <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "github_convert"})} className={"text-blue"} as={"span"}>
            <FaGithub className={"mr-1 move-top-2px"} style={{color: getTheme()}}/> Convert To Issue
        </DropdownOption>}
        {isSuspendable() && <DropdownOption tabindex={-1} onKeyPress={onTabIndex} onClick={() => setModal({open: true, type: "suspend"})} className={"text-red"} as={"span"}>
            <ActionIcon as={FaUserLock}/> Suspend User
        </DropdownOption>
        }
    </UiDropdown>
};

ModeratorActionsButton.propTypes = {
    onIdeaDelete: PropTypes.func
};

export default ModeratorActionsButton;