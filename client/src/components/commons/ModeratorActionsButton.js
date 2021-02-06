import styled from "@emotion/styled";
import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import ModeratorTagsUpdateModal from "components/commons/ModeratorTagsUpdateModal";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import PropTypes from "prop-types";
import React, {useContext, useState} from 'react';
import {FaCog, FaUserLock} from "react-icons/all";
import {FaLock, FaTags, FaTrash, FaUnlock} from "react-icons/fa";
import {useHistory} from "react-router-dom";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";
import {toastAwait, toastError, toastSuccess} from "utils/basic-utils";

const IconToggle = styled(FaCog)`
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

const DropdownOption = styled(UiDropdownElement)`
  cursor: pointer;
`;

const ModeratorActionsButton = ({onIdeaDelete = () => void 0}) => {
    const {user, getTheme} = useContext(AppContext);
    const {data: boardData, updateState: updateBoardState} = useContext(BoardContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const [modal, setModal] = useState({open: false, type: ""});
    const history = useHistory();
    const visible = boardData.moderators.find(mod => mod.userId === user.data.id);
    const onIdeaOpen = () => {
        return axios.patch("/ideas/" + ideaData.id, {"open": true}).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            updateState({...ideaData, open: true});
            toastSuccess("Idea opened.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const onIdeaClose = () => {
        return axios.patch("/ideas/" + ideaData.id, {"open": false}).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            updateState({...ideaData, open: false});
            toastSuccess("Idea closed.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const doIdeaDelete = () => {
        return axios.delete("/ideas/" + ideaData.id).then(res => {
            if (res.status !== 204) {
                toastError();
                return;
            }
            toastSuccess("Idea permanently deleted.");
            history.push("/b/" + ideaData.boardDiscriminator);
            onIdeaDelete();
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const doSuspendUser = () => {
        //todo finite suspension dates
        const date = new Date();
        const id = toastAwait("Pending suspension...");
        return axios.post("/boards/" + boardData.discriminator + "/suspendedUsers", {
            userId: ideaData.user.id,
            suspensionEndDate: (date.getFullYear() + 10) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
        }).then(res => {
            if (res.status !== 201) {
                toastError("Failed to suspend the user.", id);
                return;
            }
            toastSuccess("User suspended.", id);
            updateBoardState({...boardData, suspendedUsers: boardData.suspendedUsers.concat(res.data)});
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const onTagsManage = (appliedTags) => {
        let data = [];
        boardData.tags.forEach(tag => {
            data.push({name: tag.name, apply: appliedTags.some(d => d.name === tag.name)});
        });
        return axios.patch("/ideas/" + ideaData.id + "/tags", data).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            updateState({...ideaData, tags: res.data});
            toastSuccess("Tags updated!");
        }).catch(err => toastError(err.response.data.errors[0]));
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
    return <UiDropdown label={"Moderate Idea"} className={"d-inline mx-1"} toggleClassName={"text-black-60 p-0"} toggle={<IconToggle className={"align-baseline"}/>}>
        <DangerousActionModal id={"close"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "close"} onAction={onIdeaClose}
                              actionDescription={<div>Once you close idea you can open it again.</div>} actionButtonName={"Close"}/>
        <DangerousActionModal id={"open"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "open"} onAction={onIdeaOpen}
                              actionDescription={<div>Once you reopen idea you can close it again.</div>} actionButtonName={"Open"}/>
        <DangerousActionModal id={"delete"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "delete"} onAction={doIdeaDelete}
                              actionDescription={<div>Idea will be permanently <u>deleted</u>.</div>}/>
        <DangerousActionModal id={"suspend"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "suspend"} onAction={doSuspendUser} actionButtonName={"Suspend"}
                              actionDescription={<div>Suspended users cannot post new ideas and upvote/downvote ideas unless unsuspended through board admin panel.</div>}/>
        <ModeratorTagsUpdateModal onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "tags"} onAction={onTagsManage}/>
        <DropdownOption onClick={() => {
            setModal({open: true, type: "tags"})
        }} as={"span"}><FaTags className={"mr-1 move-top-2px"} style={{color}}/> Change Tags</DropdownOption>
        {ideaData.open ?
            <DropdownOption onClick={() => setModal({open: true, type: "close"})} as={"span"}><FaLock className={"mr-1 move-top-2px"} style={{color}}/> Close Idea</DropdownOption> :
            <DropdownOption onClick={() => setModal({open: true, type: "open"})} as={"span"}><FaUnlock className={"mr-1 move-top-2px"} style={{color}}/> Open Idea</DropdownOption>
        }
        <DropdownOption onClick={() => setModal({open: true, type: "delete"})} as={"span"}><FaTrash className={"mr-1 move-top-2px"} style={{color}}/> Delete Idea</DropdownOption>
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