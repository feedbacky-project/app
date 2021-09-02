import styled from "@emotion/styled";
import MarkdownContainer from "components/commons/MarkdownContainer";
import ModeratorActionsButton from "components/commons/ModeratorActionsButton";
import VoteButton from "components/commons/VoteButton";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import {FaThumbtack} from "react-icons/all";
import {FaLock, FaRegComment} from "react-icons/fa";
import {Link, useHistory, useLocation} from "react-router-dom";
import tinycolor from "tinycolor2";
import {UiBadge, UiCard, UiClassicIcon, UiPrettyUsername} from "ui";
import {UiCol, UiRow} from "ui/grid";
import {UiAvatar} from "ui/image";
import {convertIdeaToSlug} from "utils/basic-utils";

const CardStyle = styled(UiCard)`
  padding: 0 1rem;
  margin: .5rem 0;
  ${props => !props.pinned || (props.darkMode ? `border: 1px dashed var(--quaternary)` : `border: 1px dashed var(--disabled)`)};
`;

export const CardLinkStyle = styled(UiCol)`
  padding-left: 0;
  padding-right: 0;
  text-decoration: none !important;
  color: var(--font-color) !important;
`;

export const IdeaCardTitle = styled.span`
  font-weight: 450;
`;

export const IdeaCardDescription = styled.small`
  letter-spacing: -.1pt;
  word-break: break-word;
`;

const BadgeContainer = styled.span`
  margin-left: .25rem;
  @media (max-width: 576px) {
    margin-left: 0;
  }

  & > div:first-of-type {
    border-radius: var(--border-radius) 0 0 var(--border-radius);
  }

  & > div:nth-of-type(n+2) {
    border-radius: 0;
  }

  & > div:last-of-type {
    border-radius: 0 .35rem .35rem 0;
  }

  & > div:only-of-type {
    border-radius: var(--border-radius);
  }
`;

export const InfoContainer = styled.small`
  color: hsla(0, 0%, 0%, .6);
  float: right;
  margin-left: 0.25rem;
  transform: translateY(3px);

  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }
`;

export const PinIcon = styled(FaThumbtack)`
  transform: translateY(-2px) rotate(30deg);
`;

const IdeaCard = ({ideaData, onIdeaDelete}) => {
    const cardRef = React.createRef();
    const {user, getTheme} = useContext(AppContext);
    const {data} = useContext(BoardContext);
    const history = useHistory();
    const location = useLocation();
    const [idea, setIdea] = useState(ideaData);
    useEffect(() => setIdea(ideaData), [ideaData]);
    const renderComments = () => {
        if (idea.commentsAmount > 0) {
            return <InfoContainer>
                {idea.commentsAmount}
                <FaRegComment className={"ml-1 move-top-2px"}/>
            </InfoContainer>
        }
    };
    const renderTags = () => {
        const assignedTag = idea.assignee && idea.assignee.id === user.data.id && <UiBadge className={"move-top-2px"} style={{border: "1px dashed " + getTheme().setAlpha(.5)}}>Assigned</UiBadge>;
        if (idea.tags.length === 0 && !assignedTag) {
            return;
        }
        return <span>
            <br className={"d-sm-none"}/>
            <BadgeContainer>
                {idea.assignee !== null && idea.assignee.id === user.data.id && <UiBadge className={"move-top-2px"} style={{border: "1px dashed " + getTheme().setAlpha(.5)}}>Assigned</UiBadge>}
                {idea.tags.map((tag, i) => <UiBadge key={i} color={tinycolor(tag.color)} className={"move-top-2px"}>{tag.name}</UiBadge>)}
            </BadgeContainer>
        </span>
    };
    const renderAuthor = () => {
        return <InfoContainer>
            By {" "}
            <UiPrettyUsername user={idea.user} truncate={20}/> {" "}
            <UiAvatar className={"align-top"} roundedCircle user={idea.user} size={16}/>
        </InfoContainer>
    };
    return <IdeaContext.Provider value={{
        ideaData: idea, loaded: true, error: false,
        updateState: data => {
            setIdea(data);
            history.replace({pathname: location.pathname, state: null});
        },
    }}>
        <CardStyle innerRef={cardRef} id={"ideac_" + idea.id} bodyAs={UiRow} bodyClassName={"py-3"} pinned={idea.pinned} darkMode={user.darkMode}>
            <span className={"my-auto mr-3"}>
                <VoteButton idea={idea} animationRef={cardRef} onVote={(upvoted, votersAmount) => setIdea({...idea, upvoted, votersAmount})}/>
            </span>
            <CardLinkStyle as={Link} to={{pathname: "/i/" + convertIdeaToSlug(idea), state: {_ideaData: idea, _boardData: data}}}>
                <div>
                    <div className={"d-inline"} style={{fontSize: `1.15em`}}>
                        {idea.open || <UiClassicIcon as={FaLock} className={"mr-1 move-top-2px"}/>}
                        {!idea.pinned || <UiClassicIcon as={PinIcon} className={"mr-1"}/>}
                        <IdeaCardTitle dangerouslySetInnerHTML={{__html: idea.title}}/>
                        {renderComments()}
                    </div>
                    {renderTags()}
                    <ModeratorActionsButton onIdeaDelete={() => onIdeaDelete(idea.id)}/>
                </div>
                <MarkdownContainer as={IdeaCardDescription} text={idea.description} truncate={85} stripped/>
                {renderAuthor()}
            </CardLinkStyle>
        </CardStyle>
    </IdeaContext.Provider>
};

export default IdeaCard;