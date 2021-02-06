import axios from "axios";
import {CardLinkStyle, IdeaCardDescription, InfoContainer} from "components/board/IdeaCard";
import VoteButton from "components/commons/VoteButton";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useState} from "react";
import {FaLock, FaRegComment} from "react-icons/all";
import {Link, useHistory, useLocation} from "react-router-dom";
import {UiClassicIcon} from "ui";
import {UiRow} from "ui/grid";
import {convertIdeaToSlug, toastError, truncateText} from "utils/basic-utils";

export const SimpleIdeaCard = ({ideaData}) => {
    const cardRef = React.createRef();
    const [idea, setIdea] = useState(ideaData);
    const history = useHistory();
    const location = useLocation();
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const {user} = useContext(AppContext);
    const renderLockState = () => {
        if (idea.open) {
            return;
        }
        return <UiClassicIcon as={FaLock} className={"mr-1 move-top-2px"}/>
    };
    const renderComments = () => {
        if (idea.commentsAmount > 0) {
            return <InfoContainer>
                {idea.commentsAmount}
                <FaRegComment className={"ml-1 move-top-2px"}/>
            </InfoContainer>
        }
    };
    const onVote = () => {
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
            setIdea(data);
            history.replace({pathname: location.pathname, state: null});
        },
    }}>
        <div ref={cardRef} id={"ideac_" + idea.id} className={"m-3"}>
            <UiRow>
                <span className={"my-auto mr-2"}>
                    <VoteButton onVote={onVote}/>
                </span>
                <CardLinkStyle as={Link} className={"d-inline text-left"} to={{pathname: "/i/" + convertIdeaToSlug(idea), state: {_ideaData: idea, _boardData: data}}}>
                    <div>
                        <div className={"d-inline mr-1"} style={{letterSpacing: `-.15pt`}}>
                            {renderLockState()}
                            <span dangerouslySetInnerHTML={{__html: idea.title}}/>
                            {renderComments()}
                        </div>
                    </div>
                    <IdeaCardDescription dangerouslySetInnerHTML={{__html: truncateText(idea.description, 85)}}/>
                </CardLinkStyle>
            </UiRow>
        </div>
    </IdeaContext.Provider>
};