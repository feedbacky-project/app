import React, {Component} from 'react';
import {Button, Col, Image, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import axios from "axios";
import LoadingSpinner from "components/util/loading-spinner";
import {FaEdit, FaFrown, FaLockOpen, FaTags, FaTimesCircle} from "react-icons/fa";
import TimeAgo from "timeago-react";
import {formatUsername, getSizedAvatarByUrl, increaseBrightness, isHexDark, toastError, toastSuccess, toastWarning} from "components/util/utils";
import AppContext from "context/app-context";
import snarkdown from "components/util/snarkdown";
import InfiniteScroll from "react-infinite-scroller";
import TextareaAutosize from 'react-autosize-textarea';
import {popupSwal} from "components/util/sweetalert-utils";
import {FaHeart, FaLowVision, FaRegHeart, FaTrashAlt} from "react-icons/all";
import {parseEmojis} from "components/util/emoji-filter";
import ClickableTip from "components/util/clickable-tip";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";

class DiscussionBox extends Component {

    static contextType = AppContext;
    textarea = React.createRef();

    state = {
        comments: {data: [], loaded: false, error: false, moreToLoad: true},
        page: 0,
        submitVisible: false,
    };

    render() {
        return <Col xs={12}>
            <span className="text-black-75">Discussion ({this.props.ideaData.commentsAmount} comments)</span>
            <Col xs={12} sm={10} md={6} className="p-0 mb-1 mt-1" id="commentBox">
                {this.renderCommentBox()}
                {this.renderNoDataImage()}
            </Col>
            <Col xs={11} md={10} className="px-0" id="commentContainer">
                {this.renderComments()}
            </Col>
        </Col>
    }

    onLoadRequest = (page) => {
        return axios.get("/ideas/" + this.props.ideaData.id + "/comments?page=" + (page - 1)).then(res => {
            this.setState({
                comments: {
                    ...this.state.comments,
                    data: res.data.data.concat(this.state.comments.data),
                    loaded: true,
                    moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages,
                },
                page
            });
        }).catch(() => this.setState({
            comments: {...this.state.comments, loaded: true, error: true}
        }));
    };

    renderComments() {
        if (this.state.comments.error) {
            return <div className="text-danger mt-2 mb-3"><FaFrown/> Failed to load comments</div>
        }
        let self = this;
        return <InfiniteScroll
            pageStart={0}
            loadMore={(page) => this.onLoadRequest(page)}
            hasMore={this.state.comments.moreToLoad}
            loader={<Row className="justify-content-center my-5" key={this.state.comments.data.length}><LoadingSpinner/></Row>}>
            {this.state.comments.data.map(data => {
                if (!data.special) {
                    return <React.Fragment key={data.id}>
                        <div className="d-inline-flex mb-2" style={{wordBreak: "break-word"}}>
                            <Image roundedCircle src={getSizedAvatarByUrl(data.user.avatar, 64)} className="mr-3 mt-2" width={30} height={30} alt="avatar"
                                   onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}/>
                            <div>
                                {this.renderCommentUsername(data)}
                                {this.renderDeletionButton(data)}
                                <br/>
                                <span className="snarkdown-box" dangerouslySetInnerHTML={{__html: parseEmojis(snarkdown(data.description))}}/>
                                <br/>
                                <small className="text-black-60"> {this.renderLikes(data)} · <TimeAgo datetime={data.creationDate}/></small>
                            </div>
                        </div>
                        <br/>
                    </React.Fragment>
                }
                let color = this.context.theme;
                if (isHexDark(color) && this.context.user.darkMode) {
                    color = increaseBrightness(color, 20);
                }
                return <React.Fragment key={data.id}>
                    <div className="d-inline-flex my-1">
                        <div className="comment-icon mr-3" style={{backgroundColor: color, color}}>{self.retrieveSpecialCommentTypeIcon(data.specialType)}</div>
                        <div>
                            <span style={{color}} dangerouslySetInnerHTML={{__html: data.description}}/>
                            <small className="ml-1 text-black-60"><TimeAgo datetime={data.creationDate}/></small>
                        </div>
                    </div>
                    <br/>
                </React.Fragment>
            })}
        </InfiniteScroll>
    }

    renderCommentUsername(data) {
        if (data.viewType === "INTERNAL") {
            return <React.Fragment>
                <small style={{fontWeight: "bold"}}><span className="board-role internal">{data.user.username}</span></small>
                <OverlayTrigger overlay={<Tooltip id={"internal" + data.id + "-tooltip"}>Internal Comment</Tooltip>}>
                    <FaLowVision className="fa-xs ml-1"/>
                </OverlayTrigger>
            </React.Fragment>
        }
        return <small style={{fontWeight: "bold"}}>{formatUsername(data.user.id, data.user.username, this.props.moderators)}</small>
    }

    renderDeletionButton(data) {
        const moderator = this.props.moderators.find(mod => mod.userId === this.context.user.data.id);
        if (data.user.id !== this.context.user.data.id && !moderator) {
            return;
        }
        return <FaTrashAlt className="ml-1 fa-xs cursor-click" onClick={() => this.onCommentDelete(data.id)}/>
    }

    renderLikes(data) {
        const likes = data.likesAmount;
        if (data.liked) {
            return <span className="cursor-click" onClick={() => this.onCommentUnlike(data)}><FaHeart className="move-top-1px" style={{color: "#FE251B"}}/> {likes}</span>
        }
        return <span className="cursor-click" onClick={() => this.onCommentLike(data)}><FaRegHeart className="move-top-1px"/> {likes}</span>
    }

    retrieveSpecialCommentTypeIcon(type) {
        switch (type) {
            case "IDEA_CLOSED":
                return <FaTimesCircle className="icon"/>;
            case "IDEA_OPENED":
                return <FaLockOpen className="icon"/>;
            case "IDEA_EDITED":
                return <FaEdit className="icon"/>;
            case "LEGACY":
            case "TAGS_MANAGED":
            default:
                return <FaTags className="icon"/>;
        }
    }

    renderNoDataImage() {
        if (this.state.comments.loaded && this.state.comments.data.length === 0) {
            if (!this.props.ideaData.open) {
                return <div className="my-3 text-center">
                    <UndrawNoData style={{maxWidth: 150, maxHeight: 120, color: this.context.theme}}/>
                    <div>
                        <strong style={{fontSize: "1.1rem"}}>No comments here.</strong>
                    </div>
                </div>
            }
            return <div className="my-3 text-center">
                <UndrawNoData style={{maxWidth: 150, maxHeight: 120, color: this.context.theme}}/>
                <div>
                    <strong style={{fontSize: "1.1rem"}}>No comments yet.</strong>
                    <br/>
                    <span className="text-black-60">Maybe it's time to write one?</span>
                </div>
            </div>
        }
        return <React.Fragment/>
    }

    renderCommentBox() {
        if (!this.props.ideaData.open) {
            return;
        }
        if (this.context.user.loggedIn) {
            return <div className="d-inline-flex mb-2 col-10 px-0" style={{wordBreak: "break-word"}}>
                <div className="text-center mr-3 pt-2">
                    <Image roundedCircle src={getSizedAvatarByUrl(this.context.user.data.avatar, 64)} width={30} height={30} alt="avatar"
                           onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}/>
                    <br/>
                </div>
                <div className="col-12 px-0">
                    <small style={{fontWeight: "bold"}}>{formatUsername(this.context.user.data.id, this.context.user.data.username, this.props.moderators)}</small>
                    <br/>
                    <TextareaAutosize className="form-control bg-lighter mt-1" id="commentMessage" rows={1} maxRows={5} placeholder="Write a comment..."
                                      style={{resize: "none", overflow: "hidden"}} onChange={this.onCommentBoxKeyUp} ref={this.textarea}/>
                    {this.renderSubmitButton()}
                </div>
            </div>
        }
        return <React.Fragment/>
    }

    renderSubmitButton() {
        if (this.state.submitVisible) {
            const moderator = this.props.moderators.find(mod => mod.userId === this.context.user.data.id);
            return <React.Fragment>
                <Button variant="" className="mt-2 ml-0 mb-0 text-white" style={{backgroundColor: this.context.theme, fontSize: "0.75em"}}
                        onClick={() => this.onCommentSubmit(false)}>Submit</Button>
                {moderator && <React.Fragment>
                    <Button variant="" className="mt-2 ml-2 mr-1 mb-0 text-white" style={{backgroundColor: "#0080FF", fontSize: "0.75em"}}
                            onClick={() => this.onCommentSubmit(true)}>Submit Internal</Button>
                    <div className="d-inline-block align-top move-bottom-2px"><ClickableTip id="internalTip" title="Internal Comments" description="Comments visible only for moderators of the project, hidden from public view."/></div>
                </React.Fragment>}
            </React.Fragment>
        }
        return <React.Fragment/>
    }

    onCommentSubmit = (internal) => {
        const textarea = document.getElementById("commentMessage");
        const message = textarea.value;
        const type = internal ? "INTERNAL" : "PUBLIC";
        if (message.length < 10 || message.length > 500) {
            toastWarning("Message must be longer than 10 and shorter than 500 characters!");
            return;
        }
        axios.post("/comments/", {
            ideaId: this.props.ideaData.id,
            description: message,
            type,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            this.setState({
                comments: {
                    ...this.state.comments,
                    data: [...this.state.comments.data, res.data],
                },
                submitVisible: false,
            });
            this.textarea.current.value = "";
            this.props.onCommentPost();
        }).catch(err => {
            if (err.response.status === 400) {
                toastWarning(err.response.data.errors[0]);
                return;
            }
            toastError();
        })
    };

    //idk why but using these values in state causes app to freeze browser, current one doesn't
    onCommentBoxKeyUp = (e) => {
        let chars = e.target.value.length;
        if (chars > 0 && !this.state.submitVisible) {
            this.setState({submitVisible: true});
        }
        if (chars <= 0 && this.state.submitVisible) {
            this.setState({submitVisible: false});
        }
    };

    onCommentDelete = (id) => {
        popupSwal("warning", "Dangerous action",
            "This action is <strong>irreversible</strong> and will delete your comment, please confirm your action.",
            "Delete Comment", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/comments/" + id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    this.setState({
                        comments: {...this.state.comments, data: this.state.comments.data.filter(item => item.id !== id)}
                    });
                    this.props.onCommentDelete();
                    toastSuccess("Comment permanently deleted.");
                }).catch(err => toastError(err.response.data.errors[0]))
            });
    };

    onCommentLike = (data) => {
        axios.post("/comments/" + data.id + "/likers", {}).then(res => {
            if (res.status !== 200) {
                toastWarning("Failed to like comment.");
                return;
            }
            this.setState({
                comments: {
                    ...this.state.comments,
                    data: this.state.comments.data.map(comment => {
                        if (comment.id === data.id) {
                            comment.liked = true;
                            comment.likesAmount++;
                        }
                        return comment;
                    })
                }
            });
        });
    };

    onCommentUnlike = (data) => {
        axios.delete("/comments/" + data.id + "/likers").then(res => {
            if (res.status !== 204) {
                toastWarning("Failed to unlike comment.");
                return;
            }
            this.setState({
                comments: {
                    ...this.state.comments,
                    data: this.state.comments.data.map(comment => {
                        if (comment.id === data.id) {
                            comment.liked = false;
                            comment.likesAmount--;
                        }
                        return comment;
                    })
                }
            });
        });
    };

}

export default DiscussionBox;