import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext} from "react";
import TextareaAutosize from "react-autosize-textarea";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiPrettyUsername} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";

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

const CommentWriteBox = ({submitOpen, onCommentSubmit, onCommentBoxKeyUp}) => {
    const {serviceData, user} = useContext(AppContext);
    const {onNotLoggedClick, data} = useContext(BoardContext);
    const {ideaData} = useContext(IdeaContext);
    if (!ideaData.open && !serviceData.closedIdeasCommenting) {
        return <React.Fragment/>;
    }
    const renderSubmitButton = () => {
        if (!submitOpen) {
            return <React.Fragment/>
        }
        const moderator = data.moderators.find(mod => mod.userId === user.data.id);
        return <div className={"mt-2"}>
            <UiLoadableButton label={"Submit"} size={"sm"} onClick={() => onCommentSubmit(false)}>
                Submit
            </UiLoadableButton>

            {moderator && <React.Fragment>
                <UiLoadableButton label={"Submit Internal"} color={tinycolor("#0080FF")} size={"sm"} className={"ml-1"} onClick={() => onCommentSubmit(true)}>
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
    return <WriteBox xs={10}>
        <div className={"text-center mr-3 pt-2"}>
            {avatar}
            <br/>
        </div>
        <UiCol xs={12} className={"px-0"}>
            <UsernameBox>{username}</UsernameBox>
            <br/>
            <UiFormControl as={TextareaAutosize} className={"mt-1"} id={"commentMessage"} rows={1} maxRows={5} placeholder={"Write a comment..."}
                           style={{overflow: "hidden"}} onChange={onChange} label={"Write a comment"} onClick={onClick}/>
            {submitButton()}
        </UiCol>
    </WriteBox>
};

export default CommentWriteBox;