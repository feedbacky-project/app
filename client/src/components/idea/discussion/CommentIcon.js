import styled from "@emotion/styled";
import {AppContext} from "context";
import React, {useContext} from "react";
import {FaComment, FaCommentSlash, FaEdit, FaGithub, FaICursor, FaLink, FaLock, FaLockOpen, FaTags, FaUndoAlt, FaUnlink, FaUserCheck} from "react-icons/fa";
import {UiThemeContext} from "ui";

const IconOverlay = styled.div`
  display: flex;
  border-radius: 50%;
  height: 26px;
  min-width: 26px;
  box-shadow: 0 0 0 1px var(--background), 0 0 0 2px currentColor;
  margin-right: 1rem;
  color: ${props => props.theme};
  background-color: ${props => props.theme};
  margin-top: auto;
  margin-bottom: auto;
`;

const Icon = styled.div`
  fill: ${props => props.fill};
  display: flex;
  margin: auto;
  width: .9em;
  height: .9em;
`;

const CommentIcon = ({specialType}) => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    let color = getTheme();

    if (user.darkMode) {
        color = color.setAlpha(.2);
    }
    const retrieveSpecialCommentTypeIcon = (type) => {
        const fill = user.darkMode ? getTheme() : "white";
        switch (type) {
            case "IDEA_CLOSED":
                return <Icon as={FaLock} fill={fill}/>;
            case "IDEA_OPENED":
                return <Icon as={FaLockOpen} fill={fill}/>;
            case "IDEA_EDITED":
                return <Icon as={FaEdit} fill={fill}/>;
            case "COMMENTS_RESTRICTED":
                return <Icon as={FaCommentSlash} fill={fill}/>;
            case "COMMENTS_ALLOWED":
                return <Icon as={FaComment} fill={fill}/>;
            case "IDEA_PINNED":
                return <Icon as={FaLink} fill={fill}/>;
            case "IDEA_UNPINNED":
                return <Icon as={FaUnlink} fill={fill}/>;
            case "IDEA_ASSIGNED":
                return <Icon as={FaUserCheck} fill={fill}/>;
            case "IDEA_VOTES_RESET":
                return <Icon as={FaUndoAlt} fill={fill}/>;
            case "IDEA_TITLE_CHANGE":
                return <Icon as={FaICursor} fill={fill}/>
            case "INTEGRATION_GITHUB_CONVERT":
                return <Icon as={FaGithub} fill={fill}/>
            case "LEGACY":
            case "TAGS_MANAGED":
            default:
                return <Icon as={FaTags} fill={fill}/>;
        }
    };
    return <IconOverlay theme={color.toString()}>{retrieveSpecialCommentTypeIcon(specialType)}</IconOverlay>
};

export default CommentIcon;