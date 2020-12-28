import React, {useContext, useEffect, useState} from 'react';
import Button from "react-bootstrap/Button";
import {Col} from "react-bootstrap";
import {FaLock, FaTrash} from "react-icons/fa";
import TimeAgo from "timeago-react";
import axios from "axios";
import AppContext from "context/app-context";
import {formatUsername, htmlDecode, parseMarkdown, toastError, toastSuccess, toastWarning} from "components/util/utils";
import ModeratorActions from "components/board/moderator-actions";
import {popupSwal} from "components/util/sweetalert-utils";
import TextareaAutosize from "react-autosize-textarea";
import {FaPen} from "react-icons/all";
import VotersComponent from "components/idea/details/voters-component";
import TagsComponent from "components/idea/details/tags-component";
import AttachmentsComponent from "components/idea/details/attachments-component";
import MailSubscriptionComponent from "components/idea/details/mail-subscription-component";
import VoteButton from "components/app/vote-button";
import {useHistory} from "react-router-dom";
import {PageAvatar} from "components/app/page-avatar";
import ExecutableButton from "components/app/executable-button";
import BoardContext from "context/board-context";

const IdeaDetailsBox = ({ideaData, updateState, onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const voteRef = React.createRef();
    const history = useHistory();
    const [voters, setVoters] = useState({data: [], loaded: false, error: false});
    const [editor, setEditor] = useState({enabled: false, value: htmlDecode(ideaData.description)});
    useEffect(() => {
        axios.get("/ideas/" + ideaData.id + "/voters").then(res => {
            if (res.status !== 200) {
                setVoters({...voters, error: true});
                return;
            }
            const data = res.data;
            setVoters({...voters, data, loaded: true});
        }).catch(() => setVoters({...voters, error: true}));
        // eslint-disable-next-line
    }, []);

    const onEditApply = () => {
        let description = document.getElementById("editorBox").value;
        if (ideaData.description === description) {
            setEditor({enabled: false, value: htmlDecode(description)});
            toastWarning("Content not changed.");
            return Promise.resolve();
        }
        return axios.patch("/ideas/" + ideaData.id, {
            description
        }).then(res => {
            if (res.status !== 200) {
                toastError();
                return;
            }
            setEditor({enabled: false, value: htmlDecode(description)});
            updateState({...ideaData, description, edited: true});
            toastSuccess("Idea edited.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const onDelete = () => {
        popupSwal("warning", "Dangerous action", "This action is <strong>irreversible</strong> and will delete the idea, please confirm your action.",
            "Delete Idea", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/ideas/" + ideaData.id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    history.push("/b/" + ideaData.boardDiscriminator);
                    toastSuccess("Idea permanently deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    const onUpvote = () => {
        if (!context.user.loggedIn) {
            onNotLoggedClick();
            return;
        }
        let request;
        let upvoted;
        let votersAmount;
        if (ideaData.upvoted) {
            request = "DELETE";
            upvoted = false;
            votersAmount = ideaData.votersAmount - 1;
        } else {
            request = "POST";
            upvoted = true;
            votersAmount = ideaData.votersAmount + 1;
        }
        axios({
            method: request,
            url: "/ideas/" + ideaData.id + "/voters",
            headers: {
                "Authorization": "Bearer " + context.user.session
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            if (upvoted) {
                voteRef.current.classList.add("upvote-animation");
                setVoters({...voters, data: voters.data.concat(context.user.data)});
            } else {
                voteRef.current.classList.remove("upvote-animation");
                setVoters({...voters, data: voters.data.filter(item => item.id !== context.user.data.id)});
            }
            updateState({...ideaData, upvoted, votersAmount});
        }).catch(() => toastError());
    };
    const renderDescription = () => {
        if (editor.enabled) {
            return renderEditorMode();
        }
        return <React.Fragment>
            <span className="markdown-box" dangerouslySetInnerHTML={{__html: parseMarkdown(ideaData.description)}}/>
        </React.Fragment>
    };
    const renderEditorMode = () => {
        return <React.Fragment>
            <TextareaAutosize className="form-control bg-lighter" id="editorBox" rows={4} maxRows={12}
                              placeholder="Write a description..." required as="textarea"
                              style={{resize: "none", overflow: "hidden"}} defaultValue={htmlDecode(editor.value)}/>
            <ExecutableButton className="m-0 mt-2" variant="" style={{backgroundColor: context.getTheme()}} onClick={onEditApply}>Save</ExecutableButton>
            <Button className="m-0 mt-2 text-black-50 btn-cancel" variant="link" onClick={() => setEditor({...editor, enabled: false})}>Cancel</Button>
        </React.Fragment>
    };
    const renderDeletionButton = () => {
        //if moderator, then moderator actions component can handle that
        if (ideaData.user.id !== context.user.data.id || boardData.moderators.find(mod => mod.userId === context.user.data.id)) {
            return;
        }
        return <FaTrash className="ml-1 fa-xs cursor-click move-top-2px" onClick={onDelete}/>
    };
    const renderDetails = () => {
        return <React.Fragment>
            <span className="mr-1 text-tight" style={{fontSize: "1.45rem"}}
                  dangerouslySetInnerHTML={{__html: ideaData.title}}/>
            <ModeratorActions moderators={boardData.moderators} ideaData={ideaData} updateState={updateState}/>
            {renderDeletionButton()}
            {ideaData.user.id !== context.user.data.id || <FaPen className="ml-2 fa-xs cursor-click move-top-2px text-black-60" onClick={() => setEditor({...editor, enabled: true})}/>}
            <br/>
            <PageAvatar roundedCircle className="mr-1" url={ideaData.user.avatar} size={18} username={ideaData.user.username} style={{maxWidth: "none"}}/>
            <small>{formatUsername(ideaData.user.id, ideaData.user.username, boardData.moderators, boardData.suspendedUsers)} ·{" "}</small>
            <small className="text-black-60"><TimeAgo datetime={ideaData.creationDate}/></small>
            {!ideaData.edited || <small className="text-black-60"> · edited</small>}
        </React.Fragment>
    };
    return <React.Fragment>
        <Col sm={12} md={10} className="mt-4">
            <Col xs={12} className="d-inline-flex mb-2 p-0">
                <div className="my-auto mr-2" ref={voteRef}>
                    <VoteButton votersAmount={ideaData.votersAmount} onVote={onUpvote} upvoted={ideaData.upvoted}/>
                </div>
                <div>
                    {ideaData.open || <FaLock className="mr-1" style={{transform: "translateY(-4px)"}}/>}
                    {renderDetails()}
                </div>
            </Col>
            <Col xs={12} className="p-0">
                {renderDescription()}
            </Col>
        </Col>
        <Col md={2} xs={12}>
            <VotersComponent votersAmount={ideaData.votersAmount} data={voters}/>
            <TagsComponent data={ideaData.tags}/>
            <AttachmentsComponent ideaData={ideaData} updateState={updateState}/>
            <MailSubscriptionComponent ideaData={ideaData} updateState={updateState} onNotLoggedClick={onNotLoggedClick}/>
        </Col>
    </React.Fragment>
};

export default IdeaDetailsBox;