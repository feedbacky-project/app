import styled from "@emotion/styled";
import axios from "axios";
import ModeratorActionsButton from "components/commons/ModeratorActionsButton";
import VoteButton from "components/commons/VoteButton";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useState} from 'react';
import {Card} from "react-bootstrap";
import {FaLock, FaRegComment} from "react-icons/fa";
import {Link, useHistory, useLocation} from "react-router-dom";
import tinycolor from "tinycolor2";
import {UiBadge, UiPrettyUsername} from "ui";
import {UiCol, UiRow} from "ui/grid";
import {UiAvatar} from "ui/image";
import {convertIdeaToSlug, toastError, truncateText} from "utils/basic-utils";

const BadgeContainer = styled.span`
    & > div:first-of-type {
        border-radius: .35rem 0 0 .35rem;
    }
    & > div:nth-of-type(n+2) {
        border-radius: 0;
    }
    & > div:last-of-type {
        border-radius: 0 .35rem .35rem 0;
    }
    & > div:only-of-type {
        border-radius: .35rem;
    }
`;

export const InfoContainer = styled.small`
  color: hsla(0, 0%, 0%, .6);
  float: right;
  margin-left: 0.25rem;
  transform: translateY(3px);
  .dark & {
    color: var(--dark-font-color) !important;
  }
`;

const IdeaCard = ({ideaData, onIdeaDelete}) => {
    const cardRef = React.createRef();
    const {user} = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const history = useHistory();
    const location = useLocation();
    const [idea, setIdea] = useState(ideaData);
    const renderComments = () => {
        if (idea.commentsAmount > 0) {
            return <InfoContainer>
                {idea.commentsAmount}
                <FaRegComment className={"ml-1 move-top-2px"}/>
            </InfoContainer>
        }
    };
    const renderTags = () => {
        if (idea.tags.length === 0) {
            return;
        }
        return <span>
            <br className={"d-sm-none"}/>
            <BadgeContainer className={"mx-sm-1 mx-0"}>
                {idea.tags.map((tag, i) => <UiBadge key={i} color={tinycolor(tag.color)} className={"move-top-2px"}>{tag.name}</UiBadge>)}
            </BadgeContainer>
        </span>
    };
    const renderAuthor = () => {
        return <InfoContainer>
            By {" "}
            <UiPrettyUsername user={idea.user} truncate={20}/> {" "}
            <UiAvatar className={"m-0 move-top-1px"} roundedCircle user={idea.user} size={16}/>
        </InfoContainer>
    };
    const onUpvote = () => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return;
        }
        let request;
        let upvoted;
        let votersAmount;
        if (idea.upvoted) {
            request = "DELETE";
            upvoted = false;
            votersAmount = idea.votersAmount - 1;
        } else {
            request = "POST";
            upvoted = true;
            votersAmount = idea.votersAmount + 1;
        }
        axios({
            method: request,
            url: "/ideas/" + idea.id + "/voters"
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            if (upvoted) {
                cardRef.current.classList.add("upvote-animation");
            } else {
                cardRef.current.classList.remove("upvote-animation");
            }
            setIdea({...idea, upvoted, votersAmount});
        }).catch(() => toastError());
    };
    return <IdeaContext.Provider value={{
        ideaData: idea, loaded: true, error: false,
        updateState: data => {
            setIdea({...idea, data});
            history.replace({pathname: location.pathname, state: null});
        },
    }}>
        <Card ref={cardRef} id={"ideac_" + idea.id} className={"my-2 px-3"}>
            <Card.Body as={UiRow} className={"py-3"}>
                <span className={"my-auto mr-3"}>
                    <VoteButton onVote={onUpvote}/>
                </span>
                <UiCol as={Link} className={"d-inline px-0 text-left hidden-anchor"} to={{
                    pathname: "/i/" + convertIdeaToSlug(idea),
                    state: {_ideaData: idea, _boardData: data}
                }}>
                    <div>
                        <div className={"d-inline mr-1"} style={{fontSize: `1.15em`}}>
                            {idea.open || <FaLock className={"fa-xs mr-1 move-top-2px"}/>}
                            <span dangerouslySetInnerHTML={{__html: idea.title}}/>
                            {renderComments()}
                        </div>
                        {renderTags()}
                        <ModeratorActionsButton onIdeaDelete={() => onIdeaDelete(idea.id)}/>
                    </div>
                    <small className={"text-black-60"} style={{letterSpacing: `-.1pt`}} dangerouslySetInnerHTML={{__html: truncateText(idea.description, 85)}}/>
                    {renderAuthor()}
                </UiCol>
            </Card.Body>
        </Card>
    </IdeaContext.Provider>
};

export default IdeaCard;