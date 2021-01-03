import React, {useContext, useState} from 'react';
import axios from "axios";
import {FaLock, FaRegComment} from "react-icons/fa";
import {Card} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";
import {convertIdeaToSlug, formatUsername, toastError, truncateText} from "components/util/utils";
import ModeratorActions from "components/board/moderator-actions";
import tinycolor from "tinycolor2";
import PageBadge from "components/app/page-badge";
import VoteButton from "components/app/vote-button";
import BoardContext from "context/board-context";
import {PageAvatar} from "components/app/page-avatar";

const IdeaCard = ({data, onIdeaDelete, onNotLoggedClick}) => {
    const cardRef = React.createRef();
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const [idea, setIdea] = useState(data);
    const renderComments = () => {
        if (idea.commentsAmount > 0) {
            return <small className="comments-container">
                {idea.commentsAmount}
                <FaRegComment className="ml-1 move-top-2px"/>
            </small>
        }
    };
    const renderTags = () => {
        if (idea.tags.length === 0) {
            return;
        }
        return <span>
            <br className="d-sm-none"/>
            <span className="badge-container mx-sm-1 mx-0">
                {idea.tags.map((tag, i) => <PageBadge key={i} text={tag.name} color={tinycolor(tag.color)} className="move-top-2px"/>)}
            </span>
        </span>
    };
    const renderAuthor = () => {
        return <small className="author-container">
            By {" "}
            {formatUsername(idea.user.id, truncateText(idea.user.username, 20), boardData.moderators, boardData.suspendedUsers)} {" "}
            <PageAvatar className="m-0 move-top-1px" roundedCircle url={idea.user.avatar} username={idea.user.username} size={16}/>
        </small>
    };
    const updateState = (newData) => {
        setIdea(newData);
    };
    const onUpvote = () => {
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
    return <Card ref={cardRef} id={"container_idea_" + idea.id} className="my-2 container col" style={{borderRadius: 0, display: `block`}}>
        <Card.Body className="py-3 row">
            <span className="my-auto mr-3">
                <VoteButton votersAmount={idea.votersAmount} onVote={onUpvote} upvoted={idea.upvoted}/>
            </span>
            <Link className="d-inline col px-0 text-left hidden-anchor" to={{
                pathname: "/i/" + convertIdeaToSlug(idea),
                state: {_ideaData: idea, _boardData: boardData}
            }}>
                <div>
                    <div className="d-inline mr-1" style={{fontSize: `1.15em`}}>
                        {idea.open || <FaLock className="fa-xs mr-1 move-top-2px"/>}
                        <span dangerouslySetInnerHTML={{__html: idea.title}}/>
                        {renderComments()}
                    </div>
                    {renderTags()}
                    <ModeratorActions ideaData={idea} updateState={updateState} onIdeaDelete={() => onIdeaDelete(idea.id)}/>
                </div>
                <small className="text-black-60" style={{letterSpacing: `-.1pt`}} dangerouslySetInnerHTML={{__html: truncateText(idea.description, 85)}}/>
                {renderAuthor()}
            </Link>
        </Card.Body>
    </Card>
};

export default IdeaCard;