import React, {useContext, useState} from "react";
import VoteButton from "components/app/vote-button";
import {Link, useHistory, useLocation} from "react-router-dom";
import {convertIdeaToSlug, toastError, truncateText} from "components/util/utils";
import BoardContext from "context/board-context";
import {FaLock, FaRegComment} from "react-icons/all";
import axios from "axios";
import AppContext from "context/app-context";
import IdeaContext from "../../context/idea-context";

export const SimpleIdeaCard = ({data, onNotLoggedClick}) => {
    const cardRef = React.createRef();
    const [idea, setIdea] = useState(data);
    const history = useHistory();
    const location = useLocation();
    const boardData = useContext(BoardContext).data;
    const context = useContext(AppContext);
    const renderLockState = () => {
        if (idea.open) {
            return;
        }
        return <FaLock className="fa-xs mr-1 move-top-2px"/>
    };
    const renderComments = () => {
        if (idea.commentsAmount > 0) {
            return <small className="comments-container">
                {idea.commentsAmount}
                <FaRegComment className="ml-1 move-top-2px"/>
            </small>
        }
    };
    const onVote = () => {
        if (!context.user.loggedIn) {
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
            url: "/ideas/" + idea.id + "/voters",
            headers: {
                "Authorization": "Bearer " + context.user.session
            }
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
        updateState: (data) => {
            setIdea({...idea, data});
            history.replace({pathname: location.pathname, state: null});
        },
    }}>
        <div ref={cardRef} id={"container_idea_" + idea.id} className="m-3" style={{borderRadius: 0, display: `block`}}>
            <div className="row">
            <span className="my-auto mr-2">
                <VoteButton votersAmount={idea.votersAmount} onVote={onVote} upvoted={idea.upvoted}/>
            </span>
                <Link className="d-inline col px-0 text-left hidden-anchor" to={{
                    pathname: "/i/" + convertIdeaToSlug(idea),
                    state: {_ideaData: idea, _boardData: boardData}
                }}>
                    <div>
                        <div className="d-inline mr-1" style={{letterSpacing: `-.15pt`}}>
                            {renderLockState()}
                            <span dangerouslySetInnerHTML={{__html: idea.title}}/>
                            {renderComments()}
                        </div>
                    </div>
                    <small className="text-black-60" style={{letterSpacing: `-.15pt`}} dangerouslySetInnerHTML={{__html: truncateText(idea.description, 90)}}/>
                </Link>
            </div>
        </div>
    </IdeaContext.Provider>
};