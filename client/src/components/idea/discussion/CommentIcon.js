import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from "react";
import {FaEdit, FaLock, FaLockOpen, FaTags} from "react-icons/all";

const Icon = styled.div`
  text-align: center;
  border-radius: 50%;
  height: 30px;
  min-width: 30px;
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px var(--background), 0 0 0 2px currentColor;
  margin-right: 1rem;
  
  .dark & {
    box-shadow: 0 0 0 1px var(--dark-background), 0 0 0 2px currentColor;
  }
  
  .icon {
    vertical-align: bottom;
  }
`;

const CommentIcon = ({specialType}) => {
    const {user, getTheme} = useContext(AppContext);
    let color = getTheme();
    if (user.darkMode) {
        color = color.setAlpha(.2);
    }
    const retrieveSpecialCommentTypeIcon = (type) => {
        const fill = user.darkMode ? getTheme() : "white";
        switch (type) {
            case "IDEA_CLOSED":
                return <FaLock className={"icon"} fill={fill}/>;
            case "IDEA_OPENED":
                return <FaLockOpen className={"icon"} fill={fill}/>;
            case "IDEA_EDITED":
                return <FaEdit className={"icon"} fill={fill}/>;
            case "LEGACY":
            case "TAGS_MANAGED":
            default:
                return <FaTags className={"icon"} fill={fill}/>;
        }
    };
    return <Icon style={{backgroundColor: color, color, minWidth: 30}}>{retrieveSpecialCommentTypeIcon(specialType)}</Icon>
};

export default CommentIcon;