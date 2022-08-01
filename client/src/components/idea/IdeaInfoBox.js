import axios from "axios";
import MarkdownContainer from "components/commons/MarkdownContainer";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import VoteButton from "components/commons/VoteButton";
import AssigneeInfo from "components/idea/info/AssigneeInfo";
import AttachmentsInfo from "components/idea/info/AttachmentsInfo";
import MetadataInfo from "components/idea/info/MetadataInfo";
import NotificationsInfo from "components/idea/info/NotificationsInfo";
import TagsInfo from "components/idea/info/TagsInfo";
import TitleInfo from "components/idea/info/TitleInfo";
import VotersInfo from "components/idea/info/VotersInfo";
import {ShareBox, ShareBoxAlignment} from "components/idea/ShareBox";
import {AppContext, IdeaContext} from "context";
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {FaTrash} from "react-icons/fa";
import {useHistory} from "react-router-dom";
import {UiThemeContext} from "ui";
import {UiCancelButton, UiLoadableButton} from "ui/button";
import {UiMarkdownFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {htmlDecodeEntities, popupError, popupNotification} from "utils/basic-utils";

const IdeaInfoBox = forwardRef(({onStateChange}, ref) => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const voteRef = React.createRef();
    const history = useHistory();
    const [voters, setVoters] = useState({data: [], loaded: false, error: false});
    const [editor, setEditor] = useState({enabled: false, titleValue: htmlDecodeEntities(ideaData.title), value: htmlDecodeEntities(ideaData.description)});
    const [modal, setModal] = useState({open: false});
    const [updatedAttachment, setUpdatedAttachment] = useState(null);
    useEffect(() => {
        onLoadRequest();
        // eslint-disable-next-line
    }, []);
    useImperativeHandle(ref, () => ({
        onStateChange() {
            onLoadRequest();
        }
    }));

    const onLoadRequest = () => {
        axios.get("/ideas/" + ideaData.id + "/voters").then(res => {
            if (res.status !== 200) {
                setVoters({...voters, error: true});
                return;
            }
            const data = res.data;
            setVoters({...voters, data, loaded: true});
        }).catch(() => setVoters({...voters, error: true}));
    };
    const onEditApply = () => {
        let title = editor.titleValue;
        //within 15 minutes (in millis)
        let titleEditable = new Date() - new Date(ideaData.creationDate) <= 900000;
        let description = editor.value;
        if (ideaData.title === title && ideaData.description === description && updatedAttachment == null) {
            if(titleEditable)
            setEditor({...editor, enabled: false});
            popupNotification("Nothing changed", getTheme());
            return Promise.resolve();
        }
        const data = titleEditable ? {title, description, attachment: updatedAttachment} : {description, attachment: updatedAttachment};
        return axios.patch("/ideas/" + ideaData.id, data).then(res => {
            if (res.status !== 200) {
                popupError();
                return;
            }
            setEditor({enabled: false, titleValue: htmlDecodeEntities(res.data.title), value: htmlDecodeEntities(res.data.description)});
            updateState({...ideaData, title: res.data.title, description: res.data.description, edited: true});
            onStateChange("both");
            popupNotification("Idea edited", getTheme());
        });
    };
    const onDelete = () => {
        return axios.delete("/ideas/" + ideaData.id).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            history.push("/b/" + ideaData.boardDiscriminator);
            popupNotification("Idea deleted", getTheme());
        });
    };
    const renderDescription = () => {
        if (editor.enabled) {
            return renderEditorMode();
        }
        return <MarkdownContainer text={ideaData.description}/>
    };
    const renderEditorMode = () => {
        return <React.Fragment>
            <UiMarkdownFormControl as={TextareaAutosize} id={"editorBox"} rows={4} maxRows={12} placeholder={"Write a description..."}
                                   required label={"Write a description"} onChange={e => setEditor({...editor, value: e.target.value})}
                                   style={{resize: "none", overflow: "hidden"}} defaultValue={editor.value}/>
            <div className={"m-0 mt-2"}>
                <UiLoadableButton label={"Save"} small onClick={onEditApply}>Save</UiLoadableButton>
                <UiCancelButton className={"ml-1"} small onClick={() => setEditor({...editor, enabled: false})}>Cancel</UiCancelButton>
            </div>
        </React.Fragment>
    };
    const onVote = (upvoted, votersAmount) => {
        updateState({...ideaData, upvoted, votersAmount});
        if (upvoted) {
            setVoters({...voters, data: voters.data.concat(user.data)});
        } else {
            setVoters({...voters, data: voters.data.filter(voter => voter.id !== user.data.id)});
        }
    };
    return <React.Fragment>
        <DangerousActionModal id={"ideaDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onDelete}
                              actionDescription={<div>Idea will be permanently <u>deleted</u>.</div>} Icon={FaTrash}/>
        <UiCol sm={12} md={10}>
            <UiCol xs={12} className={"d-inline-flex mb-2 p-0"}>
                <div className={"my-auto mr-2"} ref={voteRef}>
                    <VoteButton idea={ideaData} animationRef={voteRef} onVote={onVote}/>
                </div>
                <TitleInfo editor={editor} setEditor={setEditor} setModal={setModal} onStateChange={onStateChange}/>
            </UiCol>
            <UiCol xs={12} className={"p-0 mb-3"}>
                {renderDescription()}
            </UiCol>
        </UiCol>
        <UiCol md={2} xs={12}>
            <VotersInfo data={voters}/>
            <TagsInfo/>
            <AttachmentsInfo editor={editor} onAttachmentUpdate={(data) => setUpdatedAttachment(data)}/>
            <AssigneeInfo/>
            <NotificationsInfo/>
            <MetadataInfo/>
            <ShareBoxAlignment><ShareBox/></ShareBoxAlignment>
        </UiCol>
    </React.Fragment>
});

export default IdeaInfoBox;