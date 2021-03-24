import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import MarkdownContainer from "components/commons/MarkdownContainer";
import VoteButton from "components/commons/VoteButton";
import AttachmentsInfo from "components/idea/info/AttachmentsInfo";
import NotificationsInfo from "components/idea/info/NotificationsInfo";
import TagsInfo from "components/idea/info/TagsInfo";
import TitleInfo from "components/idea/info/TitleInfo";
import VotersInfo from "components/idea/info/VotersInfo";
import AppContext from "context/AppContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useEffect, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {useHistory} from "react-router-dom";
import {UiCancelButton, UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {htmlDecode, popupError, popupNotification} from "utils/basic-utils";

const IdeaInfoBox = () => {
    const {user, getTheme} = useContext(AppContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const voteRef = React.createRef();
    const history = useHistory();
    const [voters, setVoters] = useState({data: [], loaded: false, error: false});
    const [editor, setEditor] = useState({enabled: false, value: htmlDecode(ideaData.description)});
    const [modal, setModal] = useState({open: false});
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
        let description = editor.value;
        if (ideaData.description === description) {
            setEditor({enabled: false, value: htmlDecode(description)});
            popupNotification("Nothing changed", getTheme());
            return Promise.resolve();
        }
        return axios.patch("/ideas/" + ideaData.id, {
            description
        }).then(res => {
            if (res.status !== 200) {
                popupError();
                return;
            }
            setEditor({enabled: false, value: htmlDecode(description)});
            updateState({...ideaData, description, edited: true});
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
                           style={{resize: "none", overflow: "hidden"}} defaultValue={htmlDecode(editor.value)}/>
            <div className={"m-0 mt-2"}>
                <UiLoadableButton label={"Save"} size={"sm"} onClick={onEditApply}>Save</UiLoadableButton>
                <UiCancelButton size={"sm"} onClick={() => setEditor({...editor, enabled: false})}>Cancel</UiCancelButton>
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
                        if(upvoted) {
                            setVoters({...voters, data: voters.data.concat(user.data)});
                        } else {
                            setVoters({...voters, data: voters.data.filter(voter => voter.id !== user.data.id)});
                        }
                    }}/>
                </div>
                <TitleInfo editor={editor} setEditor={setEditor} setModal={setModal}/>
            </UiCol>
            <UiCol xs={12} className={"p-0 mb-3"}>
                {renderDescription()}
            </UiCol>
        </UiCol>
        <UiCol md={2} xs={12}>
            <VotersInfo data={voters}/>
            <TagsInfo/>
            <AttachmentsInfo/>
            <NotificationsInfo/>
        </UiCol>
    </React.Fragment>
};

export default IdeaInfoBox;