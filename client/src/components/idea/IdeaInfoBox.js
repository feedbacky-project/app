import axios from "axios";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import MarkdownContainer from "components/commons/MarkdownContainer";
import VoteButton from "components/commons/VoteButton";
import AssigneeInfo from "components/idea/info/AssigneeInfo";
import AttachmentsInfo from "components/idea/info/AttachmentsInfo";
import NotificationsInfo from "components/idea/info/NotificationsInfo";
import TagsInfo from "components/idea/info/TagsInfo";
import TitleInfo from "components/idea/info/TitleInfo";
import VotersInfo from "components/idea/info/VotersInfo";
import {ShareBox, ShareBoxAlignment} from "components/idea/ShareBox";
import {AppContext, IdeaContext} from "context";
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {useHistory} from "react-router-dom";
import {UiCancelButton, UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {htmlDecodeEntities, popupError, popupNotification} from "utils/basic-utils";

const IdeaInfoBox = forwardRef(({onStateChange}, ref) => {
    const {user, getTheme} = useContext(AppContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const voteRef = React.createRef();
    const history = useHistory();
    const [voters, setVoters] = useState({data: [], loaded: false, error: false});
    const [editor, setEditor] = useState({enabled: false, value: htmlDecodeEntities(ideaData.description)});
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
        let description = editor.value;
        if (ideaData.description === description && updatedAttachment == null) {
            setEditor({...editor, enabled: false});
            popupNotification("Nothing changed", getTheme());
            return Promise.resolve();
        }
        return axios.patch("/ideas/" + ideaData.id, {
            description, attachment: updatedAttachment
        }).then(res => {
            if (res.status !== 200) {
                popupError();
                return;
            }
            setEditor({enabled: false, value: htmlDecodeEntities(res.data.description)});
            updateState({...ideaData, description: res.data.description, edited: true});
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
            <UiFormControl as={TextareaAutosize} className={"bg-lighter"} id={"editorBox"} rows={4} maxRows={12}
                           placeholder={"Write a description..."} required label={"Write a description"} onChange={e => setEditor({...editor, value: e.target.value})}
                           style={{resize: "none", overflow: "hidden"}} defaultValue={editor.value}/>
            <div className={"m-0 mt-2"}>
                <UiLoadableButton label={"Save"} small onClick={onEditApply}>Save</UiLoadableButton>
                <UiCancelButton small onClick={() => setEditor({...editor, enabled: false})}>Cancel</UiCancelButton>
            </div>
        </React.Fragment>
    };
    return <React.Fragment>
        <DangerousActionModal id={"ideaDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onDelete}
                              actionDescription={<div>Idea will be permanently <u>deleted</u>.</div>}/>
        <UiCol sm={12} md={10}>
            <UiCol xs={12} className={"d-inline-flex mb-2 p-0"}>
                <div className={"my-auto mr-2"} ref={voteRef}>
                    <VoteButton idea={ideaData} animationRef={voteRef} onVote={(upvoted, votersAmount) => {
                        updateState({...ideaData, upvoted, votersAmount});
                        if (upvoted) {
                            setVoters({...voters, data: voters.data.concat(user.data)});
                        } else {
                            setVoters({...voters, data: voters.data.filter(voter => voter.id !== user.data.id)});
                        }
                    }}/>
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
            <ShareBoxAlignment><ShareBox/></ShareBoxAlignment>
        </UiCol>
    </React.Fragment>
});

export default IdeaInfoBox;