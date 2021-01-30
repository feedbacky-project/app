import styled from "@emotion/styled";
import BoardContext from "context/BoardContext";
import React, {useContext} from "react";
import {FaBan} from "react-icons/all";
import {truncateText} from "utils/basic-utils";

const AdminRole = styled.span`
  color: hsl(2, 100%, 50%);
  .dark & {
    color: hsl(2, 98%, 61%);
  }
`;
const ModeratorRole = styled.span`
  color: hsl(101, 78%, 41%);
  .dark & {
    color: hsl(122, 98%, 61%);
  }
`;
const SuspendedRole = styled.span`
  color: hsla(0, 0%, 0%, .5);
  .dark & {
    color: hsl(0, 0%, 66%);
  }
`;

const UiPrettyUsername = (props) => {
    const {user, truncate = -1} = props;
    const {suspendedUsers, moderators} = useContext(BoardContext).data;
    const isSuspended = suspendedUsers.find(suspended => suspended.user.id === user.id);
    let username = user.username;
    if (truncate > 0) {
        username = truncateText(username, truncate);
    }
    if (isSuspended) {
        return <SuspendedRole><FaBan className={"fa-xs move-top-1px"}/> {username}</SuspendedRole>
    }
    const moderator = moderators.find(mod => mod.userId === user.id);
    if (moderator == null) {
        return username;
    }
    switch (moderator.role.toLowerCase()) {
        case "owner":
        case "admin":
            return <AdminRole>{username}</AdminRole>;
        case "moderator":
            return <ModeratorRole>{username}</ModeratorRole>;
        case "user":
        default:
            return username;
    }
};

export {UiPrettyUsername};