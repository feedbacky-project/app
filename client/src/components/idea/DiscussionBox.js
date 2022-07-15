import styled from "@emotion/styled";
import {ReactComponent as UndrawNetworkError} from "assets/svg/undraw/network_error.svg";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import {SvgNotice} from "components/commons/SvgNotice";
import CommentsBox from "components/idea/discussion/CommentsBox";
import CommentWriteBox from "components/idea/discussion/CommentWriteBox";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useState} from 'react';
import {FaTrash, FaUserLock} from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import {UiLoadingSpinner, UiThemeContext} from "ui";
import {UiButton} from "ui/button";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiCol, UiRow} from "ui/grid";
import {popupError, popupNotification, popupWarning, prepareFilterAndSortRequests, scrollIntoView} from "utils/basic-utils";

const DiscussionTitle = styled.div`
  display: inline-block;
  margin-right: .25em;
  vertical-align: middle;
  color: hsla(0, 0%, 0%, .75);

  .dark & {
    color: hsla(0, 0%, 95%, .75);
  }
`;

const DiscussionBox = forwardRef((props, ref) => {
    const {user, onLocalPreferencesUpdate, loginIntent, setIntent, onIntentComplete} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {data, updateState: updateBoardState, onNotLoggedClick} = useContext(BoardContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const [comments, setComments] = useState({data: [], loaded: false, error: false, moreToLoad: true, page: 0});
    const [page, setPage] = useState(0);
    const [modal, setModal] = useState({open: true, type: "", data: -1});
    const [replyTo, setReplyTo] = useState(null);
    const sorts = [
        {newest: "Newest"},
        {oldest: "Oldest"}
    ];
    useImperativeHandle(ref, () => ({
        onStateChange() {
            onLoadRequest(true);
        }
    }));
    useEffect(() => {
        onLoadRequest(true);
        // eslint-disable-next-line
    }, [user.localPreferences]);
    useEffect(() => {
        if(loginIntent !== null && loginIntent.includes("COMMENT_REACT") && user.loggedIn) {
            const intentData = loginIntent.split(";");
            const commentId = intentData[1];
            const reactionId = intentData[2];
            onCommentReact(commentId, reactionId);
            onIntentComplete();
        }
    }, [loginIntent, user]);

    const onLoadRequest = (override) => {
        const currentPage = override ? 0 : page;
        return axios.get("/ideas/" + ideaData.id + "/comments?page=" + currentPage + prepareFilterAndSortRequests(user.localPreferences.comments)).then(res => {
            if (override) {
                setComments({...comments, data: res.data.data, loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, page, error: false});
            } else {
                setComments({...comments, data: comments.data.concat(res.data.data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, page, error: false});
            }
            setPage(currentPage + 1);
        }).catch(() => {
            setComments({...comments, loaded: true, error: true})
        });
    };
    const renderComments = () => {
        if (comments.error) {
            return <div className={"text-center"}>
                <SvgNotice Component={UndrawNetworkError} title={"Network Error"} description={"Failed to load comments"}/>
                <UiButton className={"mt-1"} label={"Reload"} small onClick={() => onLoadRequest(true)}>Reload</UiButton>
            </div>
        }
        return <InfiniteScroll
            style={{overflow: "initial"}}
            next={onLoadRequest}
            hasMore={comments.moreToLoad}
            dataLength={comments.data.length}
            loader={<UiRow centered className={"mt-5 pt-5"}><UiLoadingSpinner/></UiRow>}>
            {comments.data.map(data => {
                    if (data.replyTo != null) {
                        return <React.Fragment key={data.id}/>
                    }
                    return <CommentsBox key={data.id} data={data} onCommentUpdate={onCommentUpdate} onCommentDelete={onCommentPreDelete} onCommentReact={onCommentReact}
                                        onCommentUnreact={onCommentUnreact} onSuspend={onPreSuspend} onReply={onReply} comments={comments.data} replyToComment={replyTo}/>
                }
            )}
        </InfiniteScroll>
    };
    const renderNoDataImage = () => {
        if (comments.loaded && comments.data.length === 0 && !comments.error) {
            if (!ideaData.open) {
                return <SvgNotice Component={UndrawNoData} title={"No comments here."}/>
            }
            return <SvgNotice Component={UndrawNoData} title={"No comments here."} description={"Maybe it's time to write one?"}/>
        }
        return <React.Fragment/>
    };
    const onReply = (data) => {
        setTimeout(() => {
            scrollIntoView("replyBox", false);
            //time for animation to scroll into the element
            setTimeout(() => {
                const textarea = document.getElementById("commentMessage");
                textarea.value = (textarea.value + "@" + data.user.username + "#" + data.user.id).trim();
                textarea.focus();
            }, 200);
        }, 100);
        setReplyTo(data);
    }
    const onCommentUpdate = (data) => {
        const newComments = [...comments.data];
        const index = newComments.findIndex(c => c.id === data.id);
        newComments[index] = data;
        setComments({...comments, data: newComments});
        onLoadRequest(true);
    };
    const onCommentSubmit = (returnData) => {
        if (user.localPreferences.comments.sort === "newest") {
            const newData = comments.data;
            newData.unshift(returnData);
            setComments({...comments, data: newData});
        } else {
            setComments({...comments, data: [...comments.data, returnData]});
        }
        updateBoardState({...data, commentsAmount: ideaData.commentsAmount + 1});
    };
    const onPreSuspend = commentData => setModal({open: true, type: "suspend", data: commentData.user.id});
    const onSuspend = () => {
        //todo finite suspension dates
        const date = new Date();
        return axios.post("/boards/" + data.discriminator + "/suspendedUsers", {
            userId: modal.data,
            suspensionEndDate: (date.getFullYear() + 10) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
        }).then(res => {
            if (res.status !== 201) {
                popupError("Failed to suspend the user");
                return;
            }
            popupNotification("User suspended", getTheme());
            updateBoardState({...data, suspendedUsers: data.suspendedUsers.concat(res.data)});
        }).catch(err => popupError(err.response.data.errors[0]));
    };
    const onCommentPreDelete = id => setModal({open: true, type: "delete", data: id});
    const onCommentDelete = () => {
        return axios.delete("/comments/" + modal.data).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            setComments({...comments, data: comments.data.filter(item => item.id !== modal.data)});
            updateState({...ideaData, commentsAmount: ideaData.commentsAmount - 1});
            popupNotification("Comment deleted", getTheme());
        });
    };
    const onCommentReact = (commentId, reactionId) => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return Promise.resolve();
        }
        return axios.post("/comments/" + commentId + "/reactions", {reactionId}).then(res => {
            if (res.status !== 200) {
                popupWarning("Failed to add reaction");
                return;
            }
            setComments({
                ...comments, data: comments.data.map(comment => {
                    if (comment.id === commentId) {
                        comment.reactions.push(res.data);
                    }
                    return comment;
                })
            });
        });
    };
    const onCommentUnreact = (commentId, reactionId) => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return Promise.resolve();
        }
        return axios.delete("/comments/" + commentId + "/reactions/" + reactionId).then(res => {
            if (res.status !== 204) {
                popupWarning("Failed to remove reaction");
                return;
            }
            setComments({
                ...comments, data: comments.data.map(comment => {
                    if (comment.id === commentId) {
                        const reaction = comment.reactions.find(r => r.user.id === user.data.id && r.reactionId === reactionId);
                        comment.reactions = comment.reactions.filter(r => r !== reaction);
                    }
                    return comment;
                })
            });
        });
    };
    const sortCurrentValue = Object.values(sorts.find(obj => {
        return Object.keys(obj)[0] === (user.localPreferences.comments.sort || "newest");
    }));
    const sortValues = sorts.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => onLocalPreferencesUpdate({...user.localPreferences, comments: {...user.localPreferences.comments, sort: key}})}>{value}</UiDropdownElement>
    });
    return <UiCol xs={12}>
        <DangerousActionModal id={"suspend"} onHide={() => setModal({...modal, open: false, type: ""})} isOpen={modal.open && modal.type === "suspend"} onAction={onSuspend}
                              actionDescription={<div>Suspended users cannot post new ideas and upvote/downvote ideas unless unsuspended through board admin panel.</div>} Icon={FaUserLock}/>
        <DangerousActionModal id={"commentDel"} onHide={() => setModal({...modal, open: false, type: ""})} isOpen={modal.open && modal.type === "delete"} onAction={onCommentDelete}
                              actionDescription={<div>Comment will be permanently <u>deleted</u>.</div>} Icon={FaTrash}/>
        <div className={"pb-1"}>
            <DiscussionTitle>Discussion ({ideaData.commentsAmount} comments)</DiscussionTitle>
            <UiSelectableDropdown label={"Choose Sort"} id={"sort"} className={"d-inline-block"} currentValue={sortCurrentValue} values={sortValues}/>
        </div>
        <UiCol xs={12} sm={10} md={6} className={"p-0 mb-1 mt-1"} id={"commentBox"}>
            <CommentWriteBox onCommentSubmit={onCommentSubmit} replyTo={replyTo} setReplyTo={setReplyTo}/>
            {renderNoDataImage()}
        </UiCol>
        <UiCol xs={12} sm={11} md={10} className={"px-0"}>
            {renderComments()}
        </UiCol>
    </UiCol>
});

export default DiscussionBox;