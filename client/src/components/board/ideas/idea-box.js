import React, {Component} from 'react';
import Button from "react-bootstrap/Button";
import axios from "axios";
import {FaLock, FaRegComment} from "react-icons/fa";
import {Badge, Card} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "../../../context/app-context";
import {formatUsername, getSizedAvatarByUrl, increaseBrightness, isHexDark, toastError, truncateText} from "../../util/utils";
import ModeratorActions from "../moderator-actions";
import {FiChevronsUp, FiChevronUp} from "react-icons/fi";

class IdeaBox extends Component {

    static contextType = AppContext;
    justVoted = false;

    state = {
        ideaData: this.props.data,
        tags: [],
    };

    render() {
        let classes = "my-2 container col";
        if (this.justVoted) {
            classes += " animated pulse on-vote";
            this.justVoted = false;
        }
        return <Card id={"container_idea_" + this.state.ideaData.id} className={classes} style={{borderRadius: 0, display: `block`}}>
            <Card.Body className="py-3 row">
                    <span className="my-auto mr-3">
                        {this.renderButton()}
                    </span>
                <Link className="d-inline col px-0 text-left hidden-anchor" to={{
                    pathname: "/i/" + this.state.ideaData.id,
                    state: {_ideaData: this.state.ideaData, _boardData: this.props.boardData, _moderators: this.props.moderators}
                }}>
                    <div>
                        <div className="d-inline mr-1" style={{fontSize: `1.15em`}}>
                            {this.renderLockState()}
                            <span dangerouslySetInnerHTML={{__html: this.state.ideaData.title}}/>
                            {this.renderComments()}
                        </div>
                        {this.renderTags()}
                        <ModeratorActions moderators={this.props.moderators} ideaData={this.state.ideaData} onStateChange={this.onStateChange}
                                          onTagsUpdate={this.onTagsUpdate} onIdeaDelete={() => this.props.onIdeaDelete(this.state.ideaData.id)}/>
                    </div>
                    <small className="text-black-60" style={{letterSpacing: `-.1pt`}} dangerouslySetInnerHTML={{__html: truncateText(this.state.ideaData.description, 85)}}/>
                    {this.renderAuthor()}
                </Link>
            </Card.Body>
        </Card>
    }

    renderButton() {
        let color = this.context.theme;
        if (this.context.user.darkMode && isHexDark(color)) {
            color = increaseBrightness(color, 40);
        }
        let vote;
        if (!this.state.ideaData.upvoted) {
            color += "80";
            vote = <FiChevronUp style={{color}}/>;
        } else {
            vote = <FiChevronsUp style={{color}}/>;
        }
        return <Button className="grey-text font-weight-bold vote-button z-depth-0 px-2 py-1 m-0 no-upvote-js"
                       style={{lineHeight: '16px', minWidth: 35, minHeight: 45, fontSize: 15}}
                       onClick={this.onUpvote} variant="">
            {vote}
            <span className="d-block bg-transparent"
                  style={{color: color}}>{this.state.ideaData.votersAmount}</span>
        </Button>
    }

    renderLockState() {
        if (this.state.ideaData.open) {
            return;
        }
        return <FaLock className="fa-xs mr-1 move-top-2px"/>
    }

    renderComments() {
        if (this.state.ideaData.commentsAmount > 0) {
            return <small className="text-black-60 float-right move-bottom-3px">
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
            <br className="d-sm-none"/> {" "}
            <span className="badge-container">
                {this.state.ideaData.tags.map((tag, i) => {
                    let color = tag.color;
                    if (this.context.user.darkMode) {
                        color += "BF";
                    }
                    return <Badge key={i} color="" style={{
                        transform: `translateY(-2px)`,
                        backgroundColor: color
                    }}>{tag.name}</Badge>
                })}
                </span> {" "}
            </span>
    }

    onStateChange = (bool) => {
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                open: bool,
            }
        });
    };

    onTagsUpdate = (data) => {
        this.setState({
            ideaData: {
                ...this.state.ideaData,
                tags: data,
            }
        });
    };

    renderAuthor() {
        return <small className="text-black-60 float-right ml-1 move-bottom-3px">
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
            url: this.context.apiRoute + "/ideas/" + this.state.ideaData.id + "/voters",
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
                ideaData: {
                    ...prevState.ideaData,
                    upvoted,
                    votersAmount
                }
            }));
        }).catch(() => {
            toastError();
        });
    };

}

export default IdeaBox;