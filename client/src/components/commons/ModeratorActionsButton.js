import styled from "@emotion/styled";
import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import ModeratorTagsUpdateModal from "components/commons/ModeratorTagsUpdateModal";
import {AppContext, BoardContext, IdeaContext} from "context";
import PropTypes from "prop-types";
import React, {useContext, useState} from 'react';
import {FaCog, FaComment, FaCommentSlash, FaLink, FaUnlink, FaUserLock} from "react-icons/all";
import {FaLock, FaTags, FaTrash, FaUnlock} from "react-icons/fa";
import {useHistory} from "react-router-dom";
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

const ModeratorActionsButton = ({onIdeaDelete = () => void 0, onStateChange = () => void 0}) => {
    const {user, getTheme} = useContext(AppContext);
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
            onStateChange();
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
            onStateChange();
        });
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
    return <UiDropdown label={"Moderate Idea"} className={"d-inline mx-1"} toggleClassName={"text-black-60 p-0"} toggle={<IconToggle className={"align-baseline"}/>}>
        <DangerousActionModal id={"close"} onHide={hide} isOpen={modal.open && modal.type === "close"}
                              onAction={() => doIdeaStateChange("open", false, "Idea closed.", "Idea opened.")}
                              actionDescription={<div>Once you close idea you can open it again.</div>} actionButtonName={"Close"}/>
        <DangerousActionModal id={"open"} onHide={hide} isOpen={modal.open && modal.type === "open"}
                              onAction={() => doIdeaStateChange("open", true, "Idea opened.", "Idea closed.")}
                              actionDescription={<div>Once you reopen idea you can close it again.</div>} actionButtonName={"Open"}/>
        <DangerousActionModal id={"delete"} onHide={hide} isOpen={modal.open && modal.type === "delete"} onAction={doIdeaDelete}
                              actionDescription={<div>Idea will be permanently <u>deleted</u>.</div>}/>
        <DangerousActionModal id={"suspend"} onHide={hide} isOpen={modal.open && modal.type === "suspend"} onAction={doSuspendUser} actionButtonName={"Suspend"}
                              actionDescription={<div>Suspended users cannot post new ideas and upvote/downvote ideas unless unsuspended through board admin panel.</div>}/>
        <DangerousActionModal id={"enable_comments"} onHide={hide} isOpen={modal.open && modal.type === "enable_comments"}
                              onAction={() => doIdeaStateChange("commentingRestricted", false, "Commenting enabled.", "Commenting disabled.")}
                              actionDescription={<div>Everyone will be able to comment this idea.</div>} actionButtonName={"Enable"}/>
        <DangerousActionModal id={"restrict_comments"} onHide={hide} isOpen={modal.open && modal.type === "restrict_comments"}
                              onAction={() => doIdeaStateChange("commentingRestricted", true, "Commenting disabled.", "Commenting enabled.")}
                              actionDescription={<div>Only moderators will be able to comment this idea.</div>} actionButtonName={"Disable"}/>
        <DangerousActionModal id={"unpin"} onHide={hide} isOpen={modal.open && modal.type === "unpin"}
                              onAction={() => doIdeaStateChange("pinned", false, "Idea unpinned.", "Idea pinned.")}
                              actionDescription={<div>Idea will no longer be pinned at the top of ideas list.</div>} actionButtonName={"Unpin"}/>
        <DangerousActionModal id={"pin"} onHide={hide} isOpen={modal.open && modal.type === "pin"}
                              onAction={() => doIdeaStateChange("pinned", true, "Idea pinned.", "Idea unpinned.")}
                              actionDescription={<div>Idea will be pinned at the top of ideas list.</div>} actionButtonName={"Pin"}/>
        <ModeratorTagsUpdateModal onHide={hide} isOpen={modal.open && modal.type === "tags"} onAction={onTagsManage}/>
        <DropdownOption onClick={() => {
            setModal({open: true, type: "tags"})
        }} as={"span"}><FaTags className={"mr-1 move-top-2px"} style={{color}}/> Change Tags</DropdownOption>
        {ideaData.open ?
            <DropdownOption onClick={() => setModal({open: true, type: "close"})} as={"span"}><FaLock className={"mr-1 move-top-2px"} style={{color}}/> Close Idea</DropdownOption> :
            <DropdownOption onClick={() => setModal({open: true, type: "open"})} as={"span"}><FaUnlock className={"mr-1 move-top-2px"} style={{color}}/> Open Idea</DropdownOption>
        }
        <DropdownOption onClick={() => setModal({open: true, type: "delete"})} as={"span"}><FaTrash className={"mr-1 move-top-2px"} style={{color}}/> Delete Idea</DropdownOption>
        {ideaData.commentingRestricted ?
            <DropdownOption onClick={() => setModal({open: true, type: "enable_comments"})} as={"span"}><FaComment className={"mr-1 move-top-2px"} style={{color}}/> Enable Comments</DropdownOption> :
            <DropdownOption onClick={() => setModal({open: true, type: "restrict_comments"})} as={"span"}><FaCommentSlash className={"mr-1 move-top-2px"} style={{color}}/> Disable Comments</DropdownOption>
        }
        {ideaData.pinned ?
            <DropdownOption onClick={() => setModal({open: true, type: "unpin"})} as={"span"}><FaUnlink className={"mr-1 move-top-2px"} style={{color}}/> Unpin Idea</DropdownOption> :
            <DropdownOption onClick={() => setModal({open: true, type: "pin"})} as={"span"}><FaLink className={"mr-1 move-top-2px"} style={{color}}/> Pin Idea</DropdownOption>
        }
        {isSuspendable() && <DropdownOption onClick={() => setModal({open: true, type: "suspend"})} className={"text-red"} as={"span"}>
            <FaUserLock className={"mr-1 move-top-2px"} style={{color: getTheme()}}/> Suspend User
        </DropdownOption>
        }
    </UiDropdown>
};

ModeratorActionsButton.propTypes = {
    onIdeaDelete: PropTypes.func
};

export default ModeratorActionsButton;