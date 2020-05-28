import React, {Component} from 'react';
import axios from "axios";
import {FaLock, FaRegComment} from "react-icons/fa";
import {Card} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";
import {formatUsername, getSizedAvatarByUrl, toastError, truncateText} from "components/util/utils";
import ModeratorActions from "components/board/moderator-actions";
import tinycolor from "tinycolor2";
import PageBadge from "components/app/page-badge";
import VoteButton from "components/app/vote-button";

class IdeaBox extends Component {

    static contextType = AppContext;
    justVoted = false;

    state = {
        ideaData: this.props.data,
    };

    render() {
        let classes = "my-2 container col";
        if (this.justVoted) {
            classes += " upvote-animation";
            this.justVoted = false;
        }
        return <Card id={"container_idea_" + this.state.ideaData.id} className={classes} style={{borderRadius: 0, display: `block`}}>
            <Card.Body className="py-3 row">
                    <span className="my-auto mr-3">
                        <VoteButton votersAmount={this.state.ideaData.votersAmount} onVote={this.onUpvote} upvoted={this.state.ideaData.upvoted} justVoted={this.justVoted}/>
                    </span>
                <Link className="d-inline col px-0 text-left hidden-anchor" to={{
                    pathname: "/i/" + this.state.ideaData.id,
                    state: {_ideaData: this.state.ideaData, _boardData: this.props.boardData}
                }}>
                    <div>
                        <div className="d-inline mr-1" style={{fontSize: `1.15em`}}>
                            {this.renderLockState()}
                            <span dangerouslySetInnerHTML={{__html: this.state.ideaData.title}}/>
                            {this.renderComments()}
                        </div>
                        {this.renderTags()}
                        <ModeratorActions ideaData={this.state.ideaData} updateState={this.updateState} onIdeaDelete={() => this.props.onIdeaDelete(this.state.ideaData.id)}/>
                    </div>
                    <small className="text-black-60" style={{letterSpacing: `-.1pt`}} dangerouslySetInnerHTML={{__html: truncateText(this.state.ideaData.description, 85)}}/>
                    {this.renderAuthor()}
                </Link>
            </Card.Body>
        </Card>
    }

    renderLockState() {
        if (this.state.ideaData.open) {
            return;
        }
        return <FaLock className="fa-xs mr-1 move-top-2px"/>
    }

    renderComments() {
        if (this.state.ideaData.commentsAmount > 0) {
            return <small className="comments-container">
                {this.state.ideaData.commentsAmount}
                <FaRegComment className="ml-1 move-top-2px"/>
            </small>
        }
    }

    renderTags() {
        if (this.state.ideaData.tags.length === 0) {
            return;
        }
        return <span>
            <br className="d-sm-none"/>
            <span className="badge-container mx-sm-1 mx-0">
                {this.state.ideaData.tags.map((tag, i) => <PageBadge key={i} text={tag.name} color={tinycolor(tag.color)} className="move-top-2px"/>)}
            </span>
        </span>
    }

    updateState = (data) => {
        this.setState({ideaData: {...this.state.ideaData, data}});
    };

    renderAuthor() {
        return <small className="author-container">
            By {" "}
            {formatUsername(this.state.ideaData.user.id, truncateText(this.state.ideaData.user.username, 20), this.props.moderators)} {" "}
            <img className="img-responsive m-0 rounded-circle move-top-1px" alt="avatar"
                 src={getSizedAvatarByUrl(this.state.ideaData.user.avatar, 32)}
                 onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}
                 width={16} height={16}/>
        </small>
    }

    onUpvote = () => {
        if (!this.context.user.loggedIn) {
            this.props.onNotLoggedClick();
            return;
        }
        let request;
        let upvoted;
        let votersAmount;
        if (this.state.ideaData.upvoted) {
            request = "DELETE";
            upvoted = false;
            votersAmount = this.state.ideaData.votersAmount - 1;
        } else {
            request = "POST";
            upvoted = true;
            votersAmount = this.state.ideaData.votersAmount + 1;
        }
        axios({
            method: request,
            url: "/ideas/" + this.state.ideaData.id + "/voters",
            headers: {
                "Authorization": "Bearer " + this.context.user.session
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            this.justVoted = upvoted;
            this.setState(prevState => ({
                ideaData: {...prevState.ideaData, upvoted, votersAmount}
            }));
        }).catch(() => toastError());
    };

}

export default IdeaBox;