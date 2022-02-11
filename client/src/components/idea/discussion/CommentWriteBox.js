import styled from "@emotion/styled";
import axios from "axios";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext, useState} from "react";
import TextareaAutosize from "react-autosize-textarea";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiPrettyUsername} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {popupError, popupWarning} from "utils/basic-utils";

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

const CommentWriteBox = ({onCommentSubmit}) => {
    const {user} = useContext(AppContext);
    const {onNotLoggedClick, data} = useContext(BoardContext);
    const {ideaData} = useContext(IdeaContext);
    const isModerator = data.moderators.find(mod => mod.userId === user.data.id);
    const [submitOpen, setSubmitOpen] = useState(false);
    if (!ideaData.open && !data.closedIdeasCommentingEnabled) {
        return <React.Fragment/>;
    }
    const onSubmit = (internal) => {
        const textarea = document.getElementById("commentMessage");
        const message = textarea.value;
        const type = internal ? "INTERNAL" : "PUBLIC";
        if (message.length < 10 || message.length > 1800) {
            popupWarning("Message must be longer than 10 and shorter than 1800 characters");
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
            setSubmitOpen(false);
            document.getElementById("commentMessage").value = "";
            onCommentSubmit(res.data);
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
    const renderSubmitButton = () => {
        if (!submitOpen) {
            return <React.Fragment/>
        }
        return <div className={"mt-2"}>
            <UiLoadableButton label={"Submit"} small onClick={() => onSubmit(false)}>
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
    const avatar = user.loggedIn ? <UiAvatar roundedCircle size={30} user={user.data}/> : <UiAvatar roundedCircle size={30} user={null}/>;
    const username = user.loggedIn ? <UiPrettyUsername user={user.data}/> : "Anonymous";
    const onChange = user.loggedIn ? onCommentBoxKeyUp : onNotLoggedClick;
    const onClick = user.loggedIn ? () => void 0 : e => {
        e.target.blur();
        onNotLoggedClick();
    };
    const submitButton = user.loggedIn ? renderSubmitButton : () => void 0;
    const renderWriteCommentForm = () => {
      if(ideaData.commentingRestricted && !isModerator) {
          return <UiFormControl disabled className={"mt-1"} id={"commentMessage"} rows={1} maxRows={5} placeholder={"Commenting restricted to moderators only."}
                                style={{overflow: "hidden"}} label={"Commenting restricted"}/>;
      }
      return <UiFormControl as={TextareaAutosize} className={"mt-1"} id={"commentMessage"} rows={1} maxRows={5} placeholder={"Write a comment..."}
                            style={{overflow: "hidden"}} onChange={onChange} label={"Write a comment"} onClick={onClick}/>;
    };
    return <WriteBox xs={10}>
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
};

export default CommentWriteBox;