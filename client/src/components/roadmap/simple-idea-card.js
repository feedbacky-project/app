import React, {useContext, useState} from "react";
import VoteButton from "components/app/vote-button";
import {Link} from "react-router-dom";
import {toastError, truncateText} from "components/util/utils";
import BoardContext from "context/board-context";
import {FaLock, FaRegComment} from "react-icons/all";
import axios from "axios";
import AppContext from "context/app-context";

export const SimpleIdeaCard = ({data, onNotLoggedClick}) => {
    const [idea, setIdea] = useState(data);
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
            setIdea({...idea, upvoted, votersAmount});
        }).catch(() => toastError());
    };
    return <div id={"container_idea_" + idea.id} className="m-3" style={{borderRadius: 0, display: `block`}}>
        <div className="row">
            <span className="my-auto mr-2">
                <VoteButton votersAmount={idea.votersAmount} onVote={onVote} upvoted={idea.upvoted}/>
            </span>
            <Link className="d-inline col px-0 text-left hidden-anchor" to={{
                pathname: "/i/" + idea.id,
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
};