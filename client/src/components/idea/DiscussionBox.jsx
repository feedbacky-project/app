import React, {Component} from 'react';
import {Button, Col, Image, Row} from "react-bootstrap";
import axios from "axios";
import LoadingSpinner from "../util/LoadingSpinner";
import {FaEdit, FaFrown, FaLockOpen, FaTags, FaTimesCircle} from "react-icons/fa";
import TimeAgo from "timeago-react";
import {formatUsername, getSimpleRequestConfig, getSizedAvatarByUrl, increaseBrightness, isHexDark, toastError, toastSuccess, toastWarning} from "../util/Utils";
import AppContext from "../../context/AppContext";
import snarkdown from "../util/snarkdown";
import {ReactSVG} from "react-svg";
import InfiniteScroll from "react-infinite-scroller";
import TextareaAutosize from 'react-autosize-textarea';
import {popupSwal} from "../util/SwalUtils";
import {FaHeart, FaRegHeart, FaTrashAlt} from "react-icons/all";

class DiscussionBox extends Component {

    static contextType = AppContext;
    textarea = React.createRef();

    state = {
        data: [],
        loaded: false,
        error: false,
        loaderVisible: true,
        page: 0,
        submitVisible: false,
        moreToLoad: true,
    };

    render() {
        return <Col xs="12">
            <span className="text-black-75">Discussion ({this.props.ideaData.commentsAmount} comments)</span>
            <Col xs="12" sm="10" md="6" className="p-0 mb-1 mt-1" id="commentBox">
                {this.renderCommentBox()}
                {this.renderNoDataImage()}
            </Col>
            <Col xs="11" md="10" className="px-0">
                {this.renderComments()}
            </Col>
        </Col>
    }

    onLoadRequest = (page) => {
        return axios.get(this.context.apiRoute + "/ideas/" + this.props.ideaData.id + "/comments?page=" + (page - 1), getSimpleRequestConfig(this.context.user.session))
            .then(res => {
                const ideas = res.data.data;
                this.setState({loaded: true, data: this.state.data.concat(ideas), page, moreToLoad: res.data.pageMetadata.currentPage !== res.data.pageMetadata.pages});
            }).catch(() => {
                this.setState({error: true, loaded: true});
            });
    };

    renderComments() {
        if (this.state.error) {
            return <div className="text-danger mt-2 mb-3"><FaFrown/> Failed to load comments</div>
        }
        let self = this;
        return <InfiniteScroll
            pageStart={0}
            loadMore={(page) => this.onLoadRequest(page)}
            hasMore={this.state.moreToLoad}
            loader={<Row className="justify-content-center my-5" key={"loader_" + this.state.data.length}><LoadingSpinner/></Row>}>
            {this.state.data.map(data => {
                if (!data.special) {
                    return <React.Fragment key={"comment_" + data.id}>
                        <div className="d-inline-flex mb-2" style={{wordBreak: "break-word"}}>
                            <div className="text-center mr-3 pt-2">
                                <Image roundedCircle src={getSizedAvatarByUrl(data.user.avatar, 64)} width={30} height={30} alt="avatar"
                                       onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}/>
                                <br/>
                            </div>
                            <div>
                                <small style={{fontWeight: "bold"}}>{formatUsername(data.user.id, data.user.username, this.props.moderators)}</small>
                                {this.renderDeletionButton(data)}
                                <br/>
                                <span className="snarkdown-box" dangerouslySetInnerHTML={{__html: snarkdown(data.description)}}/>
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
                return <React.Fragment key={"comment_special_" + data.id}>
                    <div className="d-inline-flex my-1">
                        <div className="text-center mr-3">
                            <div style={{height: "1.8rem", width: "1.8rem", color}}>{self.retrieveSpecialCommentTypeIcon(data.specialType)}</div>
                        </div>
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
                return <FaTimesCircle style={{height: "1.2em", width: "1.2em"}}/>;
            case "IDEA_OPENED":
                return <FaLockOpen style={{height: "1.2em", width: "1.2em"}}/>;
            case "IDEA_EDITED":
                return <FaEdit style={{height: "1.2em", width: "1.2em"}}/>;
            case "LEGACY":
            case "TAGS_MANAGED":
            default:
                return <FaTags style={{height: "1.2em", width: "1.2em"}}/>;
        }
    }

    renderNoDataImage() {
        if (this.state.loaded && this.state.data.length === 0) {
            if (!this.props.ideaData.open) {
                return <div className="my-3 text-center">
                    <ReactSVG src="https://cdn.feedbacky.net/static/svg/undraw_no_data.svg"
                              beforeInjection={svg => {
                                  svg.setAttribute('style', 'max-width: 150px; max-height: 120px; color: ' + this.context.theme);
                              }}/>
                    <div>
                        <strong style={{fontSize: "1.1rem"}}>No comments here.</strong>
                    </div>
                </div>
            }
            return <div className="my-3 text-center">
                <ReactSVG src="https://cdn.feedbacky.net/static/svg/undraw_no_data.svg"
                          beforeInjection={svg => {
                              svg.setAttribute('style', 'max-width: 150px; max-height: 120px; color: ' + this.context.theme);
                          }}/>
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
            return <Button variant="" className="mt-2 ml-0 mb-0 text-white" style={{backgroundColor: this.context.theme, fontSize: "0.75em"}} onClick={this.onCommentSubmit}>Submit</Button>
        }
        return <React.Fragment/>
    }

    onCommentSubmit = () => {
        const textarea = document.getElementById("commentMessage");
        const message = textarea.value;
        if (message.length < 10 || message.length > 500) {
            toastWarning("Message must be longer than 10 and shorter than 500 characters!");
            return;
        }
        axios.post(this.context.apiRoute + "/comments/", {
            ideaId: this.props.ideaData.id,
            description: message,
        }, getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            this.setState({
                data: [res.data, ...this.state.data],
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
                axios.delete(this.context.apiRoute + "/comments/" + id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    this.setState({
                        data: this.state.data.filter(item => item.id !== id)
                    });
                    this.props.onCommentDelete();
                    toastSuccess("Comment permanently deleted.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

    onCommentLike = (data) => {
        axios.post(this.context.apiRoute + "/comments/" + data.id + "/likers", {}, getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                toastWarning("Failed to like comment.");
                return;
            }
            this.setState({
                data: this.state.data.map(comment => {
                    if (comment.id === data.id) {
                        comment.liked = true;
                        comment.likesAmount++;
                    }
                    return comment;
                })
            });
        });
    };

    onCommentUnlike = (data) => {
        axios.delete(this.context.apiRoute + "/comments/" + data.id + "/likers", getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 204) {
                toastWarning("Failed to unlike comment.");
                return;
            }
            this.setState({
                data: this.state.data.map(comment => {
                    if (comment.id === data.id) {
                        comment.liked = false;
                        comment.likesAmount--;
                    }
                    return comment;
                })
            });
        });
    };

}

export default DiscussionBox;