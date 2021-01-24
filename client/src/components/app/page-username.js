import React, {useContext} from "react";
import BoardContext from "../../context/board-context";
import {FaBan} from "react-icons/all";
import {truncateText} from "../util/utils";

const PageUsername = ({user, truncate = -1}) => {
    const {suspendedUsers, moderators} = useContext(BoardContext).data;
    const isSuspended = suspendedUsers.find(suspended => suspended.user.id === user.id);
    let username = user.username;
    if(truncate > 0) {
        username = truncateText(username, truncate);
    }
    if (isSuspended) {
        return <span className="board-role suspended"><FaBan className="fa-xs move-top-1px"/> {username}</span>
    }
    const moderator = moderators.find(mod => mod.userId === user.id);
    if (moderator == null) {
        return username;
    }
    switch (moderator.role.toLowerCase()) {
        case "owner":
        case "admin":
            return <span className="board-role admin">{username}</span>;
        case "moderator":
            return <span className="board-role moderator">{username}</span>;
        case "user":
        default:
            return username;
    }
};

export default PageUsername;