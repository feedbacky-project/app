import styled from "@emotion/styled";
import axios from "axios";
import MarkdownContainer from "components/commons/MarkdownContainer";
import ReactionsBox from "components/commons/ReactionsBox";
import parseComment from "components/idea/discussion/comment-parser";
import CommentIcon from "components/idea/discussion/CommentIcon";
import {AppContext, BoardContext} from "context";
import React, {useContext, useState} from "react";
import TextareaAutosize from "react-autosize-textarea";
import {FaEyeSlash, FaLowVision, FaPen, FaReply, FaTrashAlt, FaUserLock} from "react-icons/all";
import TimeAgo from "timeago-react";
import {UiClassicIcon, UiHoverableIcon, UiPrettyUsername, UiTooltip} from "ui";
import {UiCancelButton, UiClassicButton, UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiAvatar} from "ui/image";
import {htmlDecodeEntities, popupError, popupNotification, truncateText} from "utils/basic-utils";

const CommentContainer = styled.div`
  display: inline-flex;
  margin-bottom: .5rem;
  word-break: break-word;
  min-width: 55%;

  @media (max-width: 576px) {
    width: 100%;
  }
`;

const InternalContainer = styled(CommentContainer)`
  border-radius: var(--border-radius);
  background-color: var(--internal);
  padding: .5rem 1rem;
  //trick to move whole container 16 px left to align with other comments
  transform: translateX(-16px);

  //make container full width on mobile to make trick look legit
  @media (max-width: 576px) {
    width: 100vw;
    border-radius: 0 !important;
  }
`;

const ReplyButton = styled(UiClassicButton)`
  display: inline-block;
  font-size: small;
  margin-right: .25rem;
  transform: translateY(-1px);

  background-color: hsla(0, 0%, 0%, .05);
  color: hsla(0, 0%, 0%, .6);

  .dark & {
    background-color: hsla(0, 0%, 95%, .05);
    color: hsla(0, 0%, 95%, .6);
  }

  &:hover {
    background-color: hsla(0, 0%, 0%, .2) !important;
  }

  .dark &:hover {
    background-color: hsla(0, 0%, 95%, .2) !important;
  }
`;

const CommentsBox = ({data, onCommentUpdate, onCommentDelete, onCommentReact, onCommentUnreact, onSuspend, onReply, comments, parentData = null, stepSize = 0}) => {
    const {user, getTheme} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const [editor, setEditor] = useState({enabled: false, value: htmlDecodeEntities(data.description || "")});
    //smaller step size for mobile
    const stepRemSize = window.matchMedia("only screen and (max-width: 760px)").matches ? 1.75 : 2.75;
    const renderRepliesRecursive = () => {
        return comments.map(c => {
            if (c.replyTo != null && c.replyTo === data.id) {
                return <CommentsBox key={c.id} data={c} onCommentUpdate={onCommentUpdate} onCommentDelete={onCommentDelete} onCommentReact={onCommentReact}
                                    onCommentUnreact={onCommentUnreact} onSuspend={onSuspend} comments={comments} onReply={onReply}
                                    parentData={data} stepSize={stepSize >= 3 ? 3 : stepSize + 1}/>
            }
            return <React.Fragment key={c.id}/>
        });
    };

    //internal comment with limited visibility is used for comment history purposes
    if(data.viewType === "INTERNAL" && data.user == null && data.replyTo != null) {
        return <React.Fragment>
            <div className={"text-black-60 mb-2"} style={{paddingLeft: stepRemSize * stepSize + "rem"}}>
                <div style={{backgroundColor: "var(--tertiary)", borderRadius: "var(--border-radius)", display: "inline-block", padding: ".25rem .5rem"}}>
                    <FaEyeSlash className={"text-blue move-top-1px"}/> Comment details hidden
                </div>
            </div>
            {renderRepliesRecursive()}
        </React.Fragment>
    }

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
            onCommentUpdate({...data, ...res.data});
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
        return <React.Fragment>
            <small style={{fontWeight: "bold"}}><UiPrettyUsername user={data.user}/></small>
        </React.Fragment>
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
    const renderReplyButton = () => {
        if(!user.loggedIn) {
            return <React.Fragment/>
        }
        return <ReplyButton label={"Reply"} tiny onClick={() => onReply(data)}><FaReply className={"move-top-1px"}/> Reply</ReplyButton>
    };
    const renderEditorMode = () => {
        return <React.Fragment>
            <UiFormControl as={TextareaAutosize} className={"bg-lighter"} id={"editorBox"} rows={4} maxRows={12}
                           placeholder={"Write a description..."} required label={"Write a description"} onChange={e => setEditor({...editor, value: e.target.value})}
                           style={{resize: "none", overflow: "hidden", width: "100%"}} defaultValue={editor.value}/>
            <div className={"m-0 mt-2"}>
                <UiLoadableButton label={"Save"} small onClick={onEditApply}>Save</UiLoadableButton>
                <UiCancelButton className={"ml-1"} small onClick={() => setEditor({...editor, enabled: false})}>Cancel</UiCancelButton>
            </div>
        </React.Fragment>
    }
    const renderReplyData = () => {
        if (parentData == null) {
            return <React.Fragment/>
        }
        //limited visibility
        if(parentData.viewType === "INTERNAL" && parentData.user == null && parentData.replyTo != null) {
            return <div style={{paddingLeft: (stepRemSize * stepSize) + "rem"}} className={"small text-black-60"}>
                <FaReply className={"move-top-1px"}/>
                <FaEyeSlash className={"move-top-1px mx-1 text-blue"}/>
                <span>Details hidden</span>
            </div>
        }
        return <div style={{paddingLeft: (stepRemSize * stepSize) + "rem"}} className={"small text-black-60"}>
            <FaReply className={"move-top-1px"}/>
            <UiAvatar roundedCircle className={"ml-2 mr-1 move-top-1px"} size={16} user={parentData.user} style={{minWidth: "16px"}}/>
            <UiPrettyUsername user={parentData.user}/> {truncateText(parentData.description, 45)}
        </div>
    }
    const renderDescription = () => {
        let CommentComponent;
        if (data.viewType === "INTERNAL") {
            CommentComponent = InternalContainer;
        } else {
            CommentComponent = CommentContainer;
        }
        const replyStyle = (data.replyTo != null && parentData != null) ? {paddingLeft: (stepRemSize * stepSize) + "rem"} : {};
        return <React.Fragment>
            {renderReplyData()}
            <CommentComponent style={replyStyle}>
                <UiAvatar roundedCircle className={"mr-3 mt-2"} size={30} user={data.user} style={{minWidth: "30px"}}/>
                <div style={{width: "100%"}}>
                    {renderCommentUsername()}
                    <small className={"text-black-60"}> · <TimeAgo datetime={data.creationDate}/></small>
                    {!data.edited || <small className={"text-black-60"}> · edited</small>}
                    {renderEditButton()}
                    {renderDeletionButton()}
                    {renderSuspensionButton()}
                    <br/>
                    {editor.enabled ? renderEditorMode() : <MarkdownContainer text={data.description}/>}
                    <div className={"mt-1"}>
                        {renderReplyButton()}
                        <ReactionsBox className={"d-inline-block"} parentObjectId={data.id} reactionsData={data.reactions} onReact={onCommentReact} onUnreact={onCommentUnreact}/>
                    </div>
                </div>
            </CommentComponent>
            <br/>
            {renderRepliesRecursive()}
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