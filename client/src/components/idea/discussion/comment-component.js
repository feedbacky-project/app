import React, {useContext} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {formatUsername, parseMarkdown} from "components/util/utils";
import TimeAgo from "timeago-react";
import {FaEdit, FaHeart, FaLockOpen, FaLowVision, FaRegHeart, FaTags, FaTimesCircle, FaTrashAlt, FaUserLock} from "react-icons/all";
import AppContext from "context/app-context";
import BoardContext from "context/board-context";
import {PageAvatar} from "components/app/page-avatar";
import parseComment from "components/idea/discussion/comment-parser";

const CommentComponent = ({data, onCommentDelete, onCommentUnlike, onCommentLike, onSuspend}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const retrieveSpecialCommentTypeIcon = (type) => {
        switch (type) {
            case "IDEA_CLOSED":
                return <FaTimesCircle className="icon"/>;
            case "IDEA_OPENED":
                return <FaLockOpen className="icon"/>;
            case "IDEA_EDITED":
                return <FaEdit className="icon"/>;
            case "LEGACY":
            case "TAGS_MANAGED":
            default:
                return <FaTags className="icon"/>;
        }
    };
    const renderCommentUsername = () => {
        if (data.viewType === "INTERNAL") {
            return <React.Fragment>
                <small style={{fontWeight: "bold"}}><span className="board-role internal">{data.user.username}</span></small>
                <OverlayTrigger overlay={<Tooltip id={"internal" + data.id + "-tooltip"}>Internal Comment</Tooltip>}>
                    <FaLowVision className="fa-xs ml-1"/>
                </OverlayTrigger>
            </React.Fragment>
        }
        return <small style={{fontWeight: "bold"}}>{formatUsername(data.user.id, data.user.username, boardData.moderators, boardData.suspendedUsers)}</small>
    };
    const renderDeletionButton = () => {
        const moderator = boardData.moderators.find(mod => mod.userId === context.user.data.id);
        if (data.user.id !== context.user.data.id && !moderator) {
            return;
        }
        return <FaTrashAlt className="ml-1 fa-xs cursor-click" onClick={() => onCommentDelete(data.id)}/>
    };
    const isSuspendable = () => {
        if(boardData.moderators.find(mod => mod.user.id === data.user.id)) {
            return false;
        }
        return !boardData.suspendedUsers.find(suspended => suspended.user.id === data.user.id);
    };
    const renderSuspensionButton = () => {
        const moderator = boardData.moderators.find(mod => mod.userId === context.user.data.id);
        if (!moderator || !isSuspendable()) {
            return;
        }
        return <FaUserLock className="ml-1 fa-xs cursor-click" onClick={() => onSuspend(data)}/>
    };
    const renderLikes = () => {
        const likes = data.likesAmount;
        if (data.liked) {
            return <span className="cursor-click" onClick={() => onCommentUnlike(data)}><FaHeart className="red move-top-1px"/> {likes}</span>
        }
        return <span className="cursor-click" onClick={() => onCommentLike(data)}><FaRegHeart className="move-top-1px"/> {likes}</span>
    };
    if (!data.special) {
        return <React.Fragment key={data.id}>
            <div className="d-inline-flex mb-2" style={{wordBreak: "break-word"}}>
                <PageAvatar roundedCircle className="mr-3 mt-2" size={30} url={data.user.avatar} username={data.user.username} style={{minWidth: "30px"}}/>
                <div>
                    {renderCommentUsername(data)}
                    {renderDeletionButton(data)}
                    {renderSuspensionButton(data)}
                    <br/>
                    <span className="snarkdown-box" dangerouslySetInnerHTML={{__html: parseMarkdown(data.description)}}/>
                    <small className="text-black-60"> {renderLikes(data)} · <TimeAgo datetime={data.creationDate}/></small>
                </div>
            </div>
            <br/>
        </React.Fragment>
    }
    let color = context.getTheme();

    return <React.Fragment key={data.id}>
        <div className="d-inline-flex my-1">
            <div className="comment-icon mr-3" style={{backgroundColor: color, color, minWidth: 30}}>{retrieveSpecialCommentTypeIcon(data.specialType)}</div>
            <div>
                <span style={{color}}>{parseComment(data.description, boardData.moderators, boardData.tags)}</span>
                <small className="ml-1 text-black-60"><TimeAgo datetime={data.creationDate}/></small>
            </div>
        </div>
        <br/>
    </React.Fragment>
};

export default CommentComponent;