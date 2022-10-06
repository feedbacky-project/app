import styled from "@emotion/styled";
import axios from "axios";
import MarkdownContainer from "components/commons/MarkdownContainer";
import ReactionsBox from "components/commons/ReactionsBox";
import {parseComment} from "components/idea/discussion/comment-parser";
import MentionableForm from "components/idea/discussion/MentionableForm";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import TextareaAutosize from "react-autosize-textarea";
import {FaCommentSlash, FaLowVision, FaPen, FaReply, FaReplyAll, FaTrashAlt, FaUserLock} from "react-icons/fa";
import TimeAgo from "timeago-react";
import {UiClassicIcon, UiHoverableIcon, UiPrettyUsername, UiThemeContext, UiTooltip} from "ui";
import {UiCancelButton, UiClassicButton, UiLoadableButton} from "ui/button";
import {UiAvatar} from "ui/image";
import {htmlDecodeEntities, popupError, popupNotification} from "utils/basic-utils";

const CommentContainer = styled.div`
  display: inline-flex;
  margin-bottom: .5rem;
  word-break: break-word;
  min-width: 55%;
  border-radius: var(--border-radius);

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
  font-size: 80%;
  margin-left: .25rem;
  transform: translateY(-1px);
  color: hsla(0, 0%, 0%, .6);
  background-color: transparent;

  .dark & {
    color: hsla(0, 0%, 95%, .6);
  }

  &:hover {
    background-color: hsla(0, 0%, 0%, .15) !important;
  }

  .dark &:hover {
    background-color: hsla(0, 0%, 95%, .15) !important;
  }
`;

const HiddenContent = styled.div`
  display: inline-block;
  background-color: var(--tertiary);
  border-radius: var(--border-radius);
  padding: .25rem .5rem;
`;

const Separator = styled.span`
  display: inline;
  margin-left: .25rem;
  @media (max-width: 576px) {
    & {
      margin-left: 0;
      display: none;
    }
  }
`;

const CommentDate = styled.small`
  margin-top: auto;
  margin-bottom: auto;
  @media (max-width: 576px) {
    & {
      width: 100%;
    }
  }
`;

const CommentsBox = ({data, onCommentUpdate, onCommentDelete, onCommentReact, onCommentUnreact, onSuspend, onReply, comments, parentData = null, stepSize = 0, replyToComment = null}) => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData} = useContext(BoardContext);
    const {mentions} = useContext(IdeaContext);
    const [editor, setEditor] = useState({enabled: false, value: htmlDecodeEntities(data.description || "")});
    //smaller step size for mobile
    const stepRemSize = window.matchMedia("only screen and (max-width: 760px)").matches ? 1.75 : 2.75;
    useEffect(() => {
        const editorArea = document.getElementById("editorBox");
        if (!editorArea) {
            return;
        }
        editorArea.focus();
        //trick to force cursor to the end not start of textarea
        const val = editorArea.value;
        editorArea.value = "";
        editorArea.value = val;
    }, [editor.enabled]);

    const hasAnyVisibleChildren = (comment) => {
        for (const c of comments) {
            if (c.replyTo !== comment.id) {
                continue;
            }
            if (c.user == null) {
                return hasAnyVisibleChildren(c);
            } else {
                return true;
            }
        }
        return false;
    }
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
    //deleted comment is used for comment history purposes, should be only visible with a parent comment
    if (data.viewType === "DELETED") {
        if (!hasAnyVisibleChildren(data)) {
            return <React.Fragment/>
        }
        return <React.Fragment>
            <div className={"text-black-60 mb-2"} style={{paddingLeft: stepRemSize * stepSize + "rem"}}>
                <HiddenContent>
                    <FaCommentSlash className={"move-top-1px"} style={{color: "var(--font-color)"}}/> Comment deleted
                </HiddenContent>
            </div>
            {renderRepliesRecursive()}
        </React.Fragment>
    }
    //internal comment with limited visibility is used for comment history purposes
    if (data.viewType === "INTERNAL" && data.user == null) {
        if (!hasAnyVisibleChildren(data)) {
            return <React.Fragment/>
        }
        return <React.Fragment>
            <div className={"text-black-60 mb-2"} style={{paddingLeft: stepRemSize * stepSize + "rem"}}>
                <HiddenContent>
                    <FaLowVision className={"move-top-1px"} style={{color: "var(--font-color)"}}/> Comment details hidden
                </HiddenContent>
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
        return <UiHoverableIcon as={FaPen} className={"text-black-60 ml-1"} onClick={() => {
            setEditor({...editor, enabled: !editor.enabled});
        }}/>
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
        if (!user.loggedIn) {
            return <React.Fragment/>
        }
        return <ReplyButton data-id={"reply"} label={"Reply"} tiny onClick={() => onReply(data)}><FaReplyAll/></ReplyButton>
    };
    const renderEditorMode = () => {
        return <React.Fragment>
            <MentionableForm onTextUpdate={text => setEditor({...editor, value: text})} allMentions={mentions} as={TextareaAutosize} id={"editorBox"} rows={4} maxRows={12} placeholder={"Write a description..."}
                             required label={"Write a description"}
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
        //deleted comment is used for comment history purposes
        if (parentData.viewType === "DELETED") {
            return <div style={{paddingLeft: (stepRemSize * stepSize) + "rem"}} className={"small text-black-60"}>
                <FaReply className={"move-top-1px"}/>
                <FaCommentSlash className={"move-top-1px mx-1"} style={{color: "var(--font-color)"}}/>
                <span>Comment deleted</span>
            </div>
        }
        //limited visibility
        if (parentData.viewType === "INTERNAL" && parentData.user == null && parentData.replyTo != null) {
            return <div style={{paddingLeft: (stepRemSize * stepSize) + "rem"}} className={"small text-black-60"}>
                <FaReply className={"move-top-1px"}/>
                <FaLowVision className={"move-top-1px mx-1"} style={{color: "var(--font-color)"}}/>
                <span>Details hidden</span>
            </div>
        }
        return <div style={{paddingLeft: (stepRemSize * stepSize) + "rem", display: "flex"}} className={"small"}>
            <FaReply className={"text-black-60 my-auto"} style={{flexShrink: 0}}/>
            <UiAvatar roundedCircle className={"ml-2 mr-1"} size={16} user={parentData.user} style={{minWidth: "16px"}}/>
            <div style={{whiteSpace: "nowrap"}}><UiPrettyUsername user={parentData.user} truncate={16}/></div>
            <div className={"text-black-60 ml-1"} style={{textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden"}}>
                <MarkdownContainer as={"span"} text={parentData.description} truncate={55} stripped/>
            </div>
        </div>
    }
    let CommentComponent;
    if (data.viewType === "INTERNAL") {
        CommentComponent = InternalContainer;
    } else {
        CommentComponent = CommentContainer;
    }
    if (!data.special) {
        const replyStyle = (data.replyTo != null && parentData != null) ? {paddingLeft: (stepRemSize * stepSize) + "rem"} : {};
        return <React.Fragment>
            {renderReplyData()}
            <CommentComponent id={"commentc_" + data.id} style={replyStyle}>
                <UiAvatar roundedCircle className={"mr-3 mt-2"} size={26} user={data.user} style={{minWidth: "26px"}}/>
                <div style={{width: "100%"}}>
                    {renderCommentUsername()}
                    {data.metadata.via && <small className={"ml-1 text-black-60 my-auto"}>via {data.metadata.via}</small>}
                    <small className={"text-black-60"}> · <TimeAgo datetime={data.creationDate}/></small>
                    {!data.edited || <small className={"text-black-60"}> · edited</small>}
                    {renderEditButton()}
                    {renderDeletionButton()}
                    {renderSuspensionButton()}
                    <br/>
                    {editor.enabled ? renderEditorMode() :
                        <React.Fragment>
                            <MarkdownContainer text={data.description}/>
                            <div>
                                <ReactionsBox className={"d-inline-block"} parentObjectId={data.id} reactionsData={data.reactions} onReact={onCommentReact} onUnreact={onCommentUnreact}/>
                                {renderReplyButton()}
                            </div>
                        </React.Fragment>
                    }
                </div>
            </CommentComponent>
            <br/>
            {renderRepliesRecursive()}
        </React.Fragment>
    }
    return <React.Fragment>
        <div className={"d-inline-flex my-2 text-black-75"}>
            <UiAvatar roundedCircle className={"mr-3"} size={26} user={data.user} style={{minWidth: "26px"}}/>
            <div style={{display: "flex", margin: "auto 0", flexFlow: "wrap"}}>
                <span>{parseComment(data.description, boardData.moderators, boardData.tags)}</span>
                <CommentDate className={"text-black-60"}>
                    <Separator>·</Separator> <TimeAgo datetime={data.creationDate}/>
                    {data.metadata.via && <span className={"ml-1 text-black-60 my-auto"}>· via {data.metadata.via}</span>}
                </CommentDate>
            </div>
        </div>
        <br/>
    </React.Fragment>
};

export default CommentsBox;