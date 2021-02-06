import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import MarkdownContainer from "components/commons/MarkdownContainer";
import ModeratorActionsButton from "components/commons/ModeratorActionsButton";
import VoteButton from "components/commons/VoteButton";
import AttachmentsInfo from "components/idea/info/AttachmentsInfo";
import NotificationsInfo from "components/idea/info/NotificationsInfo";
import TagsInfo from "components/idea/info/TagsInfo";
import VotersInfo from "components/idea/info/VotersInfo";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useEffect, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {FaPen} from "react-icons/all";
import {FaLock, FaTrash} from "react-icons/fa";
import {useHistory} from "react-router-dom";
import TimeAgo from "timeago-react";
import {UiHoverableIcon, UiPrettyUsername} from "ui";
import {UiCancelButton, UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {htmlDecode, toastError, toastSuccess, toastWarning} from "utils/basic-utils";

const IdeaInfoBox = () => {
    const {user} = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const voteRef = React.createRef();
    const history = useHistory();
    const [voters, setVoters] = useState({data: [], loaded: false, error: false});
    const [editor, setEditor] = useState({enabled: false, value: htmlDecode(ideaData.description)});
    const [modal, setModal] = useState({open: false});
    useEffect(() => {
        axios.get("/ideas/" + ideaData.id + "/voters").then(res => {
            if (res.status !== 200) {
                setVoters({...voters, error: true});
                return;
            }
            const data = res.data;
            setVoters({...voters, data, loaded: true});
        }).catch(() => setVoters({...voters, error: true}));
        // eslint-disable-next-line
    }, []);

    const onEditApply = () => {
        let description = document.getElementById("editorBox").value;
        if (ideaData.description === description) {
            setEditor({enabled: false, value: htmlDecode(description)});
            toastWarning("Content not changed.");
            return Promise.resolve();
        }
        return axios.patch("/ideas/" + ideaData.id, {
            description
        }).then(res => {
            if (res.status !== 200) {
                toastError();
                return;
            }
            setEditor({enabled: false, value: htmlDecode(description)});
            updateState({...ideaData, description, edited: true});
            toastSuccess("Idea edited.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const onDelete = () => {
        return axios.delete("/ideas/" + ideaData.id).then(res => {
            if (res.status !== 204) {
                toastError();
                return;
            }
            history.push("/b/" + ideaData.boardDiscriminator);
            toastSuccess("Idea permanently deleted.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const onUpvote = () => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return;
        }
        let request;
        let upvoted;
        let votersAmount;
        if (ideaData.upvoted) {
            request = "DELETE";
            upvoted = false;
            votersAmount = ideaData.votersAmount - 1;
        } else {
            request = "POST";
            upvoted = true;
            votersAmount = ideaData.votersAmount + 1;
        }
        axios({
            method: request,
            url: "/ideas/" + ideaData.id + "/voters",
            headers: {
                "Authorization": "Bearer " + user.session
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            if (upvoted) {
                voteRef.current.classList.add("upvote-animation");
                setVoters({...voters, data: voters.data.concat(user.data)});
            } else {
                voteRef.current.classList.remove("upvote-animation");
                setVoters({...voters, data: voters.data.filter(item => item.id !== user.data.id)});
            }
            updateState({...ideaData, upvoted, votersAmount});
        }).catch(() => toastError());
    };
    const renderDescription = () => {
        if (editor.enabled) {
            return renderEditorMode();
        }
        return <MarkdownContainer text={ideaData.description}/>
    };
    const renderEditorMode = () => {
        return <React.Fragment>
            <UiFormControl as={TextareaAutosize} className={"bg-lighter"} id={"editorBox"} rows={4} maxRows={12}
                              placeholder={"Write a description..."} required label={"Write a description"}
                              style={{resize: "none", overflow: "hidden"}} defaultValue={htmlDecode(editor.value)}/>
            <div className={"m-0 mt-2"}>
                <UiLoadableButton label={"Save"} size={"sm"} onClick={onEditApply}>Save</UiLoadableButton>
                <UiCancelButton size={"sm"} onClick={() => setEditor({...editor, enabled: false})}>Cancel</UiCancelButton>
            </div>
        </React.Fragment>
    };
    const renderDeletionButton = () => {
        //if moderator, then moderator actions component can handle that
        if (ideaData.user.id !== user.data.id || data.moderators.find(mod => mod.userId === user.data.id)) {
            return;
        }
        return <UiHoverableIcon as={FaTrash} className={"move-top-2px text-black-60 ml-1"} onClick={() => setModal({open: true})}/>
    };
    const renderDetails = () => {
        return <React.Fragment>
            <span style={{fontSize: "1.4rem"}} dangerouslySetInnerHTML={{__html: ideaData.title}}/>
            <ModeratorActionsButton/>
            {renderDeletionButton()}
            {ideaData.user.id !== user.data.id || <UiHoverableIcon as={FaPen} className={"move-top-2px text-black-60 ml-1"} onClick={() => setEditor({...editor, enabled: true})}/>}
            <br/>
            <UiAvatar roundedCircle className={"mr-1"} user={ideaData.user} size={18} style={{maxWidth: "none"}}/>
            <small><UiPrettyUsername user={ideaData.user}/> ·{" "}</small>
            <small className={"text-black-60"}><TimeAgo datetime={ideaData.creationDate}/></small>
            {!ideaData.edited || <small className={"text-black-60"}> · edited</small>}
        </React.Fragment>
    };
    return <React.Fragment>
        <DangerousActionModal id={"ideaDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onDelete}
                              actionDescription={<div>Idea will be permanently <u>deleted</u>.</div>}/>
        <UiCol sm={12} md={10}>
            <UiCol xs={12} className={"d-inline-flex mb-2 p-0"}>
                <div className={"my-auto mr-2"} ref={voteRef}>
                    <VoteButton onVote={onUpvote}/>
                </div>
                <div>
                    {ideaData.open || <FaLock className={"mr-1"} style={{transform: "translateY(-4px)"}}/>}
                    {renderDetails()}
                </div>
            </UiCol>
            <UiCol xs={12} className={"p-0"}>
                {renderDescription()}
            </UiCol>
        </UiCol>
        <UiCol md={2} xs={12}>
            <VotersInfo data={voters}/>
            <TagsInfo/>
            <AttachmentsInfo/>
            <NotificationsInfo/>
        </UiCol>
    </React.Fragment>
};

export default IdeaInfoBox;