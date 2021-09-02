import styled from "@emotion/styled";
import axios from "axios";
import MarkdownContainer from "components/commons/MarkdownContainer";
import parseComment from "components/idea/discussion/comment-parser";
import CommentIcon from "components/idea/discussion/CommentIcon";
import {AppContext, BoardContext} from "context";
import React, {useContext, useState} from "react";
import TextareaAutosize from "react-autosize-textarea";
import {FaHeart, FaLowVision, FaPen, FaRegHeart, FaTrashAlt, FaUserLock} from "react-icons/all";
import TimeAgo from "timeago-react";
import {UiClassicIcon, UiHoverableIcon, UiPrettyUsername, UiTooltip} from "ui";
import {UiCancelButton, UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiAvatar} from "ui/image";
import {htmlDecodeEntities, popupError, popupNotification} from "utils/basic-utils";

const LikeContainer = styled.span`
  cursor: pointer;
`;

const CommentContainer = styled.div`
  display: inline-flex;
  margin-bottom: .5rem;
  word-break: break-word;
  min-width: 55%;
  
  @media(max-width: 576px) {
    width: 100%;
  }
`;

const InternalContainer = styled(CommentContainer)`
  border-radius: var(--border-radius);
  background-color: var(--internal);
  padding: .5rem 1rem;
`;

const CommentsBox = ({data, onCommentUpdate, onCommentDelete, onCommentUnlike, onCommentLike, onSuspend}) => {
    const {user, getTheme} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const [editor, setEditor] = useState({enabled: false, value: htmlDecodeEntities(data.description)});

    const onEditApply = () => {
        let description = editor.value;
        if (data.description === description) {
            setEditor({...editor, enabled: false});
            popupNotification("Nothing changed", getTheme());
            return Promise.resolve();
        }
        return axios.patch("/comments/" + data.id, {
            description
        }).then(res => {
            if (res.status !== 200) {
                popupError();
                return;
            }
            setEditor({enabled: false, value: htmlDecodeEntities(res.data.description)});
            onCommentUpdate({...data, description: res.data.description, edited: true});
            popupNotification("Comment edited", getTheme());
        });
    };
    const renderCommentUsername = () => {
        if (data.viewType === "INTERNAL") {
            return <React.Fragment>
                <small style={{fontWeight: "bold"}}><UiPrettyUsername user={data.user}/></small>
                <UiTooltip id={"internalT_" + data.id} text={"Internal Comment"}>
                    <UiClassicIcon className={"ml-1"} as={FaLowVision}/>
                </UiTooltip>
            </React.Fragment>
        }
        return <small style={{fontWeight: "bold"}}><UiPrettyUsername user={data.user}/></small>
    };
    const renderEditButton = () => {
        if (data.user.id !== user.data.id) {
            return;
        }
        return <UiHoverableIcon as={FaPen} className={"text-black-60 ml-1"} onClick={() => setEditor({...editor, enabled: !editor.enabled})}/>
    };
    const renderDeletionButton = () => {
        const moderator = boardData.moderators.find(mod => mod.userId === user.data.id);
        if (data.user.id !== user.data.id && !moderator) {
            return;
        }
        return <UiHoverableIcon as={FaTrashAlt} className={"text-black-60 ml-1"} onClick={() => onCommentDelete(data.id)}/>
    };
    const isSuspendable = () => {
        if (boardData.moderators.find(mod => mod.user.id === data.user.id)) {
            return false;
        }
        return !boardData.suspendedUsers.find(suspended => suspended.user.id === data.user.id);
    };
    const renderSuspensionButton = () => {
        const moderator = boardData.moderators.find(mod => mod.userId === user.data.id);
        if (!moderator || !isSuspendable()) {
            return;
        }
        return <UiHoverableIcon as={FaUserLock} className={"text-black-60 ml-1"} onClick={() => onSuspend(data)}/>
    };
    const renderLikes = () => {
        const likes = data.likesAmount;
        if (data.liked) {
            return <LikeContainer onClick={() => onCommentUnlike(data)}><FaHeart className={"text-red move-top-1px"}/> {likes}</LikeContainer>
        }
        return <LikeContainer onClick={() => onCommentLike(data)}><FaRegHeart className={"move-top-1px"}/> {likes}</LikeContainer>
    };
    const renderEditorMode = () => {
        return <React.Fragment>
            <UiFormControl as={TextareaAutosize} className={"bg-lighter"} id={"editorBox"} rows={4} maxRows={12}
                           placeholder={"Write a description..."} required label={"Write a description"} onChange={e => setEditor({...editor, value: e.target.value})}
                           style={{resize: "none", overflow: "hidden", width: "100%"}} defaultValue={editor.value}/>
            <div className={"m-0 mt-2"}>
                <UiLoadableButton label={"Save"} small onClick={onEditApply}>Save</UiLoadableButton>
                <UiCancelButton small onClick={() => setEditor({...editor, enabled: false})}>Cancel</UiCancelButton>
            </div>
        </React.Fragment>
    };
    const renderDescription = () => {
        let CommentComponent;
        if(data.viewType === "INTERNAL") {
            CommentComponent = InternalContainer;
        } else {
            CommentComponent = CommentContainer;
        }
        return <React.Fragment>
            <CommentComponent>
                <UiAvatar roundedCircle className={"mr-3 mt-2"} size={30} user={data.user} style={{minWidth: "30px"}}/>
                <div style={{width: "100%"}}>
                    {renderCommentUsername()}
                    {renderEditButton()}
                    {renderDeletionButton()}
                    {renderSuspensionButton()}
                    <br/>
                    {editor.enabled ? renderEditorMode() : <MarkdownContainer text={data.description}/>}
                    <small className={"text-black-60"}> {renderLikes(data)} · <TimeAgo datetime={data.creationDate}/></small>
                    {!data.edited || <small className={"text-black-60"}> · edited</small>}
                </div>
            </CommentComponent>
            <br/>
        </React.Fragment>
    };
    if (!data.special) {
        return renderDescription();
    }
    return <React.Fragment>
        <div className={"d-inline-flex my-2"}>
            <CommentIcon specialType={data.specialType}/>
            <div>
                <span style={{color: getTheme()}}>{parseComment(data.description, boardData.moderators, boardData.tags)}</span>
                <small className={"ml-1 text-black-60"}><TimeAgo datetime={data.creationDate}/></small>
            </div>
        </div>
        <br/>
    </React.Fragment>
};

export default CommentsBox;