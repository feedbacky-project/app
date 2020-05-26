import React, {Component} from 'react';
import {Button, Col, Image, Row} from "react-bootstrap";
import axios from "axios";
import LoadingSpinner from "components/util/loading-spinner";
import {FaFrown} from "react-icons/fa";
import {formatUsername, getSizedAvatarByUrl, toastError, toastSuccess, toastWarning} from "components/util/utils";
import AppContext from "context/app-context";
import InfiniteScroll from "react-infinite-scroller";
import TextareaAutosize from 'react-autosize-textarea';
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import CommentComponent from "components/idea/discussion/comment-component";

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
        this.setState({comments: {...this.state.comments, moreToLoad: false}});
        return axios.get("/ideas/" + this.props.ideaData.id + "/comments?page=" + (page - 1)).then(res => {
            this.setState({
                comments: {
                    ...this.state.comments,
                    data: this.state.comments.data.concat(res.data.data),
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
        return <InfiniteScroll
            pageStart={0}
            initialLoad={true}
            loadMore={(page) => this.onLoadRequest(page)}
            hasMore={this.state.comments.moreToLoad}
            loader={<Row className="justify-content-center my-5" key={this.state.comments.data.length}><LoadingSpinner/></Row>}>
            {this.state.comments.data.map(data =>
                <CommentComponent data={data} moderators={this.props.moderators} onCommentDelete={this.onCommentDelete} onCommentLike={this.onCommentLike} onCommentUnlike={this.onCommentUnlike}/>
            )}
        </InfiniteScroll>
    }

    renderNoDataImage() {
        if (this.state.comments.loaded && this.state.comments.data.length === 0) {
            if (!this.props.ideaData.open) {
                return <div className="my-3 text-center">
                    <UndrawNoData style={{maxWidth: 150, maxHeight: 120, color: this.context.getTheme()}}/>
                    <div>
                        <strong style={{fontSize: "1.1rem"}}>No comments here.</strong>
                    </div>
                </div>
            }
            return <div className="my-3 text-center">
                <UndrawNoData style={{maxWidth: 150, maxHeight: 120, color: this.context.getTheme()}}/>
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
                    <TextareaAutosize className="form-control mt-1" id="commentMessage" rows={1} maxRows={5} placeholder="Write a comment..."
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
                <Button variant="" className="mt-2 ml-0 mb-0" style={{backgroundColor: this.context.getTheme(), fontSize: "0.75em"}}
                        onClick={() => this.onCommentSubmit(false)}>Submit</Button>
                {moderator && <React.Fragment>
                    <Button variant="" className="mt-2 ml-2 mr-1 mb-0" style={{backgroundColor: "#0080FF", fontSize: "0.75em"}}
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
            this.props.updateState({
                ...this.props.ideaData, commentsAmount: this.props.ideaData.commentsAmount + 1
            });
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
                    this.props.updateState({
                        ...this.props.ideaData, commentsAmount: this.props.ideaData.commentsAmount - 1
                    });
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