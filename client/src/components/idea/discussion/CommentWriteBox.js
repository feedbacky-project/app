import styled from "@emotion/styled";
import axios from "axios";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import MentionableForm from "components/idea/discussion/MentionableForm";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import TextareaAutosize from "react-autosize-textarea";
import {FaTimes} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiPrettyUsername, UiThemeContext} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {popupError, popupWarning} from "utils/basic-utils";

const ReplyMarkdownOptions = styled.div`
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
`;

const ReplyBox = styled.div`
  display: flex;
  border-bottom-right-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  background-color: var(--tertiary);
  font-size: 80%;
  padding: .25rem .5rem;
`;

const ReplyCancelButton = styled(FaTimes)`
  margin-left: auto;
  margin-top: auto;
  margin-bottom: auto;
  color: ${props => props.theme};
  cursor: pointer;
`;

const WriteBox = styled(UiCol)`
  display: inline-flex;
  padding-left: 0;
  padding-right: 0;
  margin-bottom: .5rem;
  word-break: break-word;
`;

const UsernameBox = styled.small`
  font-weight: bold;
`;

const CommentWriteBox = ({onCommentSubmit, replyTo, setReplyTo}) => {
    const {user, loginIntent, setIntent, onIntentComplete} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {onNotLoggedClick, data} = useContext(BoardContext);
    const {ideaData, mentions} = useContext(IdeaContext);
    const isModerator = data.moderators.find(mod => mod.userId === user.data.id);
    const [submitOpen, setSubmitOpen] = useState(false);
    const [warningOpen, setWarningOpen] = useState(false);
    useEffect(() => {
        if(loginIntent === "COMMENT_WRITE" && user.loggedIn) {
            document.getElementById("commentMessage").focus();
            onIntentComplete();
        }
    }, [loginIntent, user]);

    if (!ideaData.open && !data.closedIdeasCommentingEnabled) {
        return <React.Fragment/>;
    }
    const onPreSubmit = () => {
        if (replyTo != null && replyTo.viewType === "INTERNAL") {
            setWarningOpen(true);
            return Promise.resolve();
        }
        return onSubmit(false);
    }
    const onSubmit = (internal) => {
        const textarea = document.getElementById("commentMessage");
        const message = textarea.value;
        const type = internal ? "INTERNAL" : "PUBLIC";
        if (message.length < 10 || message.length > 1800) {
            popupWarning("Message must be longer than 10 and shorter than 1800 characters");
            return Promise.resolve();
        }
        const reply = replyTo != null ? replyTo.id : null;
        return axios.post("/comments/", {
            ideaId: ideaData.id,
            description: message,
            type,
            replyTo: reply
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            setSubmitOpen(false);
            setReplyTo(null);
            document.getElementById("commentMessage").value = "";
            onCommentSubmit(res.data);
        });
    };
    const onCommentBoxKeyUp = (e) => {
        const {value} = e.target;
        let chars = value.length;
        if (chars > 0 && !submitOpen) {
            setSubmitOpen(true);
        }
        if (chars <= 0 && submitOpen) {
            setSubmitOpen(false);
        }
    };
    const renderSubmitButton = () => {
        if (!submitOpen) {
            return <React.Fragment/>
        }
        return <div className={"mt-2"}>
            <UiLoadableButton label={"Submit"} small onClick={onPreSubmit}>
                Submit
            </UiLoadableButton>

            {isModerator && <React.Fragment>
                <UiLoadableButton label={"Submit Internal"} color={tinycolor("#0080FF")} small className={"ml-1"} onClick={() => onSubmit(true)}>
                    Submit Internal
                </UiLoadableButton>
                <div className="d-inline-flex align-top"><UiClickableTip id={"internalTip"} title={"Internal Comments"} description={"Comments visible only for moderators of the project, hidden from public view."}/></div>
            </React.Fragment>}
        </div>
    };
    const avatar = user.loggedIn ? <UiAvatar roundedCircle size={26} user={user.data}/> : <UiAvatar roundedCircle size={26} user={null}/>;
    const username = user.loggedIn ? <UiPrettyUsername user={user.data}/> : "Anonymous";
    const onChange = user.loggedIn ? onCommentBoxKeyUp : onNotLoggedClick;
    const onClick = user.loggedIn ? () => void 0 : e => {
        e.target.blur();
        onNotLoggedClick();
        setIntent("COMMENT_WRITE");
    };
    const submitButton = user.loggedIn ? renderSubmitButton : () => void 0;
    const renderWriteCommentForm = () => {
        if (ideaData.commentingRestricted && !isModerator) {
            return <UiFormControl disabled className={"mt-1"} id={"commentMessage"} rows={1} maxRows={5} placeholder={"Commenting restricted to moderators only."}
                                  style={{overflow: "hidden"}} label={"Commenting restricted"}/>;
        }
        return <div id={"replyBox"}>
            <MentionableForm allMentions={mentions} CustomOptions={replyTo != null && ReplyMarkdownOptions} as={TextareaAutosize} className={"mt-1"} id={"commentMessage"} rows={1} maxRows={10} placeholder={"Write a comment..."}
                             style={{overflow: "hidden"}} onChange={onChange} label={"Write a comment"} onClick={onClick}/>
            {replyTo != null && <React.Fragment>
                <ReplyBox className={"text-black-60"}>
                    <span className={"text-black-75"}>Reply to</span>
                    <UiAvatar roundedCircle className={"ml-2 mr-1 move-top-1px"} size={16} user={replyTo.user} style={{minWidth: "16px"}}/>
                    <strong><UiPrettyUsername user={replyTo.user}/></strong>
                    <ReplyCancelButton theme={getTheme().toString()} onClick={() => setReplyTo(null)}/>
                </ReplyBox>
            </React.Fragment>}
        </div>
    };
    return <React.Fragment>
        <DangerousActionModal id={"postInternalBreak"} onHide={() => setWarningOpen(false)} isOpen={warningOpen}
                              onAction={() => onSubmit(false)} size={"md"}
                              actionDescription={<div>You're about to reply publicly to an <span className={"text-blue"}>internal comment</span>. This internal comment existence will be visible in comments history once you reply publicly.
                                  <div className={"mt-2"}/>
                                  All data about internal comment will be hidden.</div>} actionButtonName={"Post"}/>
        <WriteBox xs={10} md={12}>
            <div className={"text-center mr-3 pt-2"}>
                {avatar}
                <br/>
            </div>
            <UiCol xs={12} className={"px-0"}>
                <UsernameBox>{username}</UsernameBox>
                <br/>
                {renderWriteCommentForm()}
                {submitButton()}
            </UiCol>
        </WriteBox>
    </React.Fragment>
};

export default CommentWriteBox;