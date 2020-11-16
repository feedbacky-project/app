import React, {useContext, useEffect, useState} from 'react';
import {Button, Col, Dropdown, Row} from "react-bootstrap";
import axios from "axios";
import LoadingSpinner from "components/util/loading-spinner";
import {FaFrown} from "react-icons/fa";
import {formatUsername, prepareFilterAndSortRequests, toastError, toastSuccess, toastWarning} from "components/util/utils";
import AppContext from "context/app-context";
import InfiniteScroll from "react-infinite-scroller";
import TextareaAutosize from 'react-autosize-textarea';
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import CommentComponent from "components/idea/discussion/comment-component";
import {SvgNotice} from "components/app/svg-notice";
import {PageAvatar} from "components/app/page-avatar";
import {FaAngleDown} from "react-icons/all";

const DiscussionBox = ({ideaData, updateState, moderators}) => {
    const context = useContext(AppContext);
    const [comments, setComments] = useState({data: [], loaded: false, error: false, moreToLoad: true, page: 0});
    const [submitOpen, setSubmitOpen] = useState(false);
    const sorts = [
        {oldest: "Oldest"},
        {newest: "Newest"}
    ];
    useEffect(() => {
        onLoadRequest(1, true);
        // eslint-disable-next-line
    }, [context.user.localPreferences]);
    const onLoadRequest = (page, override) => {
        return axios.get("/ideas/" + ideaData.id + "/comments?page=" + (page - 1) + prepareFilterAndSortRequests(context.user.localPreferences.comments)).then(res => {
            if(override) {
                setComments({...comments, data: res.data.data, loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, page});
            } else {
                setComments({...comments, data: comments.data.concat(res.data.data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, page});
            }
        }).catch(() => setComments({...comments, loaded: true, error: true}));
    };
    const renderComments = () => {
        if (comments.error) {
            return <div className="text-danger mt-2 mb-3"><FaFrown/> Failed to load comments</div>
        }
        return <InfiniteScroll
            pageStart={0}
            initialLoad={true}
            loadMore={(page) => onLoadRequest(page)}
            hasMore={comments.moreToLoad}
            loader={<Row className="justify-content-center my-5" key={comments.data.length}><LoadingSpinner/></Row>}>
            {comments.data.map(data =>
                <CommentComponent key={data.id} data={data} onCommentDelete={onCommentDelete} onCommentLike={onCommentLike} onCommentUnlike={onCommentUnlike}/>
            )}
        </InfiniteScroll>
    };
    const renderNoDataImage = () => {
        if (comments.loaded && comments.data.length === 0) {
            if (!ideaData.open) {
                return <SvgNotice Component={UndrawNoData} title="No comments here."/>
            }
            return <SvgNotice Component={UndrawNoData} title="No comments here." description="Maybe it's time to write one?"/>
        }
        return <React.Fragment/>
    };
    const renderCommentBox = () => {
        if (!ideaData.open) {
            return;
        }
        if (context.user.loggedIn) {
            return <div className="d-inline-flex mb-2 col-10 px-0" style={{wordBreak: "break-word"}}>
                <div className="text-center mr-3 pt-2">
                    <PageAvatar roundedCircle size={30} url={context.user.data.avatar}/>
                    <br/>
                </div>
                <div className="col-12 px-0">
                    <small style={{fontWeight: "bold"}}>{formatUsername(context.user.data.id, context.user.data.username, moderators)}</small>
                    <br/>
                    <TextareaAutosize className="form-control mt-1" id="commentMessage" rows={1} maxRows={5} placeholder="Write a comment..."
                                      style={{resize: "none", overflow: "hidden"}} onChange={onCommentBoxKeyUp}/>
                    {renderSubmitButton()}
                </div>
            </div>
        }
        return <React.Fragment/>
    };
    const renderSubmitButton = () => {
        if (!submitOpen) {
            return <React.Fragment/>
        }
        const moderator = moderators.find(mod => mod.userId === context.user.data.id);
        return <React.Fragment>
            <Button variant="" className="mt-2 ml-0 mb-0" style={{backgroundColor: context.getTheme(), fontSize: "0.75em"}}
                    onClick={() => onCommentSubmit(false)}>Submit</Button>
            {moderator && <React.Fragment>
                <Button variant="" className="mt-2 ml-2 mr-1 mb-0" style={{backgroundColor: "#0080FF", fontSize: "0.75em"}}
                        onClick={() => onCommentSubmit(true)}>Submit Internal</Button>
                <div className="d-inline-block align-top move-bottom-2px"><ClickableTip id="internalTip" title="Internal Comments" description="Comments visible only for moderators of the project, hidden from public view."/></div>
            </React.Fragment>}
        </React.Fragment>
    };
    const onCommentSubmit = (internal) => {
        const textarea = document.getElementById("commentMessage");
        const message = textarea.value;
        const type = internal ? "INTERNAL" : "PUBLIC";
        if (message.length < 10 || message.length > 500) {
            toastWarning("Message must be longer than 10 and shorter than 500 characters!");
            return;
        }
        axios.post("/comments/", {
            ideaId: ideaData.id,
            description: message,
            type,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            if(context.user.localPreferences.comments.sort === "newest") {
                const newData = comments.data;
                newData.unshift(res.data);
                setComments({...comments, data: newData});
            } else {
                setComments({...comments, data: [...comments.data, res.data]});
            }
            setSubmitOpen(false);
            document.getElementById("commentMessage").value = "";
            updateState({...ideaData, commentsAmount: ideaData.commentsAmount + 1});
        }).catch(err => {
            if (err.response.status === 400) {
                toastWarning(err.response.data.errors[0]);
                return;
            }
            toastError();
        })
    };
    const onCommentBoxKeyUp = (e) => {
        let chars = e.target.value.length;
        if (chars > 0 && !submitOpen) {
            setSubmitOpen(true);
        }
        if (chars <= 0 && submitOpen) {
            setSubmitOpen(false);
        }
    };
    const onCommentDelete = (id) => {
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
                    setComments({...comments, data: comments.data.filter(item => item.id !== id)});
                    updateState({...ideaData, commentsAmount: ideaData.commentsAmount - 1});
                    toastSuccess("Comment permanently deleted.");
                }).catch(err => toastError(err.response.data.errors[0]))
            });
    };
    const onCommentLike = (data) => {
        axios.post("/comments/" + data.id + "/likers", {}).then(res => {
            if (res.status !== 200) {
                toastWarning("Failed to like comment.");
                return;
            }
            setComments({
                ...comments, data: comments.data.map(comment => {
                        if (comment.id === data.id) {
                            comment.liked = true;
                            comment.likesAmount++;
                        }
                        return comment;
                    }
                )
            });
        });
    };
    const onCommentUnlike = (data) => {
        axios.delete("/comments/" + data.id + "/likers").then(res => {
            if (res.status !== 204) {
                toastWarning("Failed to unlike comment.");
                return;
            }
            setComments({
                ...comments, data: comments.data.map(comment => {
                    if (comment.id === data.id) {
                        comment.liked = false;
                        comment.likesAmount--;
                    }
                    return comment;
                })
            });
        });
    };
    return <Col xs={12}>
        <div>
            <div className="d-inline-block text-black-75 mr-1">Discussion ({ideaData.commentsAmount} comments)</div>
            <Dropdown className="d-inline-block" style={{zIndex: 1}}>
                <Dropdown.Toggle id="sort" variant="" className="search-dropdown-bar btn btn-link text-dark move-top-1px">
                <span>{Object.values(sorts.find(obj => {
                    return Object.keys(obj)[0] === (context.user.localPreferences.comments.sort || "oldest");
                }))}</span>
                    <FaAngleDown/>
                </Dropdown.Toggle>
                <Dropdown.Menu alignRight>
                    {sorts.map(val => {
                        const key = Object.keys(val)[0];
                        const value = Object.values(val)[0];
                        return <Dropdown.Item key={key} onClick={() => context.onLocalPreferencesUpdate({...context.user.localPreferences, comments: {...context.user.localPreferences.comments, sort: key}})}>{value}</Dropdown.Item>
                    })}
                </Dropdown.Menu>
            </Dropdown>
        </div>
        <Col xs={12} sm={10} md={6} className="p-0 mb-1 mt-1" id="commentBox">
            {renderCommentBox()}
            {renderNoDataImage()}
        </Col>
        <Col xs={11} md={10} className="px-0" id="commentContainer">
            {renderComments()}
        </Col>
    </Col>
};

export default DiscussionBox;