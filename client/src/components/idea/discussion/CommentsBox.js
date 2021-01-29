import parseComment from "components/idea/discussion/comment-parser";
import CommentIcon from "components/idea/discussion/CommentIcon";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from "react";
import {FaHeart, FaLowVision, FaRegHeart, FaTrashAlt, FaUserLock} from "react-icons/all";
import TimeAgo from "timeago-react";
import UiAvatar from "ui/image/UiAvatar";
import UiPrettyUsername from "ui/UiPrettyUsername";
import UiTooltip from "ui/UiTooltip";
import {parseMarkdown} from "utils/basic-utils";
import styled from "@emotion/styled";

const CommentInternal = styled.span`
  color: hsl(210, 100%, 50%);
  
  .dark & {
    color: hsl(210, 100%, 60%);
  }
`;

const CommentsBox = ({data, onCommentDelete, onCommentUnlike, onCommentLike, onSuspend}) => {
    const {user, getTheme} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const renderCommentUsername = () => {
        if (data.viewType === "INTERNAL") {
            return <React.Fragment>
                <small style={{fontWeight: "bold"}}><CommentInternal>{data.user.username}</CommentInternal></small>
                <UiTooltip id={"internalT_" + data.id} text={"Internal Comment"}>
                    <FaLowVision className={"fa-xs ml-1"}/>
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
        return <FaTrashAlt className={"ml-1 fa-xs cursor-click text-black-60"} onClick={() => onCommentDelete(data.id)}/>
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
        return <FaUserLock className={"ml-1 fa-xs cursor-click text-black-60"} onClick={() => onSuspend(data)}/>
    };
    const renderLikes = () => {
        const likes = data.likesAmount;
        if (data.liked) {
            return <span className={"cursor-click"} onClick={() => onCommentUnlike(data)}><FaHeart className={"red move-top-1px"}/> {likes}</span>
        }
        return <span className={"cursor-click"} onClick={() => onCommentLike(data)}><FaRegHeart className={"move-top-1px"}/> {likes}</span>
    };
    if (!data.special) {
        return <React.Fragment key={data.id}>
            <div className={"d-inline-flex mb-2"} style={{wordBreak: "break-word"}}>
                <UiAvatar roundedCircle className={"mr-3 mt-2"} size={30} user={data.user} style={{minWidth: "30px"}}/>
                <div>
                    {renderCommentUsername(data)}
                    {renderDeletionButton(data)}
                    {renderSuspensionButton(data)}
                    <br/>
                    <span className={"snarkdown-box"} dangerouslySetInnerHTML={{__html: parseMarkdown(data.description)}}/>
                    <small className={"text-black-60"}> {renderLikes(data)} · <TimeAgo datetime={data.creationDate}/></small>
                </div>
            </div>
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