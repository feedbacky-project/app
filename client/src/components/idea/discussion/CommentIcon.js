import styled from "@emotion/styled";
import {AppContext} from "context";
import React, {useContext} from "react";
import {FaComment, FaCommentSlash, FaEdit, FaLink, FaLock, FaLockOpen, FaTags, FaUnlink} from "react-icons/all";

const IconOverlay = styled.div`
  text-align: center;
  border-radius: 50%;
  height: 30px;
  min-width: 30px;
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px var(--background), 0 0 0 2px currentColor;
  margin-right: 1rem;
  color: ${props => props.theme};
  background-color: ${props => props.theme};
`;

const Icon = styled.div`
  fill: ${props => props.fill};
  vertical-align: bottom;
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
            case "LEGACY":
            case "TAGS_MANAGED":
            default:
                return <Icon as={FaTags} fill={fill}/>;
        }
    };
    return <IconOverlay theme={color.toString()}>{retrieveSpecialCommentTypeIcon(specialType)}</IconOverlay>
};

export default CommentIcon;