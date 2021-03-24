import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import {SvgNotice} from "components/commons/SvgNotice";
import CommentWriteBox from "components/idea/discussion/CommentWriteBox";
import CommentsBox from "components/idea/discussion/CommentsBox";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useEffect, useState} from 'react';
import {FaFrown} from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import {UiLoadingSpinner} from "ui";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiCol, UiRow} from "ui/grid";
import {popupError, popupNotification, popupWarning, prepareFilterAndSortRequests} from "utils/basic-utils";

const DiscussionBox = () => {
    const {user, onLocalPreferencesUpdate, getTheme} = useContext(AppContext);
    const {data, updateState: updateBoardState, onNotLoggedClick} = useContext(BoardContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const [comments, setComments] = useState({data: [], loaded: false, error: false, moreToLoad: true, page: 0});
    const [submitOpen, setSubmitOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [modal, setModal] = useState({open: true, type: "", data: -1});
    const sorts = [
        {newest: "Newest"},
        {oldest: "Oldest"}
    ];
    useEffect(() => {
        onLoadRequest(true);
        // eslint-disable-next-line
    }, [user.localPreferences]);
    const onLoadRequest = (override) => {
        const currentPage = override ? 0 : page;
        return axios.get("/ideas/" + ideaData.id + "/comments?page=" + currentPage + prepareFilterAndSortRequests(user.localPreferences.comments)).then(res => {
            if (override) {
                setComments({...comments, data: res.data.data, loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, page});
            } else {
                setComments({...comments, data: comments.data.concat(res.data.data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, page});
            }
            setPage(currentPage + 1);
        }).catch(() => {
            setComments({...comments, loaded: true, error: true})
        });
    };
    const renderComments = () => {
        if (comments.error) {
            return <div className={"text-red mt-2 mb-3"}><FaFrown/> Failed to load comments</div>
        }
        return <InfiniteScroll
            style={{overflow: "initial"}}
            next={onLoadRequest}
            hasMore={comments.moreToLoad}
            dataLength={comments.data.length}
            loader={<UiRow centered className={"mt-5 pt-5"}><UiLoadingSpinner/></UiRow>}>
            {comments.data.map(data =>
                <CommentsBox key={data.id} data={data} onCommentUpdate={onCommentUpdate} onCommentDelete={onCommentPreDelete} onCommentLike={onCommentLike}
                             onCommentUnlike={onCommentUnlike} onSuspend={onPreSuspend}/>
            )}
        </InfiniteScroll>
    };
    const renderNoDataImage = () => {
        if (comments.loaded && comments.data.length === 0) {
            if (!ideaData.open) {
                return <SvgNotice Component={UndrawNoData} title={"No comments here."}/>
            }
            return <SvgNotice Component={UndrawNoData} title={"No comments here."} description={"Maybe it's time to write one?"}/>
        }
        return <React.Fragment/>
    };
    const onCommentUpdate = (data) => {
        const newComments = [...comments.data];
        const index = newComments.data.findIndex(c => c.id === data.id);
        newComments.data[index] = data;
        setComments({...comments, data: newComments});
    };
    const onCommentSubmit = (internal) => {
        const textarea = document.getElementById("commentMessage");
        const message = textarea.value;
        const type = internal ? "INTERNAL" : "PUBLIC";
        if (message.length < 10 || message.length > 500) {
            popupWarning("Message must be longer than 10 and shorter than 500 characters");
            return Promise.resolve();
        }
        return axios.post("/comments/", {
            ideaId: ideaData.id,
            description: message,
            type,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            if (user.localPreferences.comments.sort === "newest") {
                const newData = comments.data;
                newData.unshift(res.data);
                setComments({...comments, data: newData});
            } else {
                setComments({...comments, data: [...comments.data, res.data]});
            }
            setSubmitOpen(false);
            document.getElementById("commentMessage").value = "";
            updateBoardState({...data, commentsAmount: ideaData.commentsAmount + 1});
        });
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
    const onCommentLike = (data) => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return;
        }
        axios.post("/comments/" + data.id + "/likers", {}).then(res => {
            if (res.status !== 200) {
                popupWarning("Failed to like comment");
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
        if (!user.loggedIn) {
            onNotLoggedClick();
            return;
        }
        axios.delete("/comments/" + data.id + "/likers").then(res => {
            if (res.status !== 204) {
                popupWarning("Failed to unlike comment");
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
                              actionDescription={<div>Suspended users cannot post new ideas and upvote/downvote ideas unless unsuspended through board admin panel.</div>}/>
        <DangerousActionModal id={"commentDel"} onHide={() => setModal({...modal, open: false, type: ""})} isOpen={modal.open && modal.type === "delete"} onAction={onCommentDelete}
                              actionDescription={<div>Comment will be permanently <u>deleted</u>.</div>}/>
        <div>
            <div className={"d-inline-block text-black-75 mr-1"}>Discussion ({ideaData.commentsAmount} comments)</div>
            <UiSelectableDropdown label={"Choose Sort"} id={"sort"} className={"d-inline-block"} currentValue={sortCurrentValue} values={sortValues}/>
        </div>
        <UiCol xs={12} sm={10} md={6} className={"p-0 mb-1 mt-1"} id={"commentBox"}>
            <CommentWriteBox submitOpen={submitOpen} onCommentSubmit={onCommentSubmit} onCommentBoxKeyUp={onCommentBoxKeyUp}/>
            {renderNoDataImage()}
        </UiCol>
        <UiCol xs={12} sm={11} md={10} className={"px-0"}>
            {renderComments()}
        </UiCol>
    </UiCol>
};

export default DiscussionBox;