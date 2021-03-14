import styled from "@emotion/styled";
import MarkdownContainer from "components/commons/MarkdownContainer";
import parseComment from "components/idea/discussion/comment-parser";
import CommentIcon from "components/idea/discussion/CommentIcon";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from "react";
import {FaHeart, FaLowVision, FaRegHeart, FaTrashAlt, FaUserLock} from "react-icons/all";
import TimeAgo from "timeago-react";
import {UiClassicIcon, UiHoverableIcon, UiPrettyUsername, UiTooltip} from "ui";
import {UiAvatar} from "ui/image";

const LikeContainer = styled.span`
  cursor: pointer;
`;

const CommentContainer = styled.div`
  display: inline-flex;
  margin-bottom: .5rem;
  word-break: break-word;
  min-width: 55%;
`;

const InternalContainer = styled(CommentContainer)`
  border-radius: var(--border-radius);
  background-color: var(--internal);
  padding: .5rem 1rem;
  
  .dark & {
    background-color: var(--dark-internal);
  }
`;

const CommentsBox = ({data, onCommentDelete, onCommentUnlike, onCommentLike, onSuspend}) => {
    const {user, getTheme} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
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
    if (!data.special) {
        let CommentComponent;
        if(data.viewType === "INTERNAL") {
           CommentComponent = InternalContainer;
        } else {
            CommentComponent = CommentContainer;
        }
        return <React.Fragment key={data.id}>
            <CommentComponent>
                <UiAvatar roundedCircle className={"mr-3 mt-2"} size={30} user={data.user} style={{minWidth: "30px"}}/>
                <div>
                    {renderCommentUsername(data)}
                    {renderDeletionButton(data)}
                    {renderSuspensionButton(data)}
                    <br/>
                    <MarkdownContainer text={data.description}/>
                    <small className={"text-black-60"}> {renderLikes(data)} · <TimeAgo datetime={data.creationDate}/></small>
                </div>
            </CommentComponent>
            <br/>
        </React.Fragment>
    }
    return <React.Fragment key={data.id}>
        <div className={"d-inline-flex my-1"}>
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