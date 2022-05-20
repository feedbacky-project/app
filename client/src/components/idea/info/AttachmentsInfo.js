import styled from "@emotion/styled";
import axios from "axios";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import SafeAnchor from "components/commons/SafeAnchor";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext, useState} from "react";
import {FaTrash, FaUpload} from "react-icons/fa";
import {UiThemeContext} from "ui";
import {UiButton, UiElementDeleteButton} from "ui/button";
import {UiImage} from "ui/image";
import {getBase64FromFile, popupError, popupNotification, validateImageWithWarning} from "utils/basic-utils";

const Attachment = styled(UiImage)`
  background-color: var(--quaternary);
`;

const AttachmentsInfo = ({editor, onAttachmentUpdate}) => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {moderators} = useContext(BoardContext).data;
    const {ideaData, updateState} = useContext(IdeaContext);
    const [modal, setModal] = useState({open: false, data: -1, dataUrl: "", uploaded: true});

    const onAttachmentUpload = (e) => {
        if (!validateImageWithWarning(e, "attachmentUpload", 1024)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            updateState({...ideaData, attachments: [{id: 0, url: data}]});
            setModal({...modal, uploaded: false});
            onAttachmentUpdate(data);
        });
    };
    if (ideaData.attachments.length === 0 && !editor.enabled) {
        return <React.Fragment/>
    }
    if (ideaData.attachments.length === 0 && editor.enabled) {
        return <React.Fragment>
            <div className={"my-1 text-black-75"}>Attached Files</div>
            <UiButton label={"Upload Attachment"} small>
                <input accept={"image/jpeg, image/png"} type={"file"} className={"d-none"} id={"attachmentUpload"} onChange={onAttachmentUpload}/>
                <label htmlFor={"attachmentUpload"} className={"mb-0"} style={{cursor: "pointer"}}>
                    <FaUpload/> Upload
                </label>
            </UiButton>
        </React.Fragment>
    }
    const onAttachmentDelete = () => {
        return axios.delete("/attachments/" + modal.data).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            updateState({...ideaData, attachments: ideaData.attachments.filter(data => data.url !== modal.dataUrl)});
            popupNotification("Attachment removed", getTheme());
        });
    };
    const doAttachmentDelete = (attachment) => {
        //todo multiple attachments support
        //if attachment isn't uploaded to feedbacky (added in editor) then dont open real deletion modal
        if (!modal.uploaded) {
            updateState({...ideaData, attachments: []});
            return;
        }
        setModal({open: true, data: attachment.id, dataUrl: attachment.url, uploaded: true});
    };
    //todo lightbox for attachments
    return <React.Fragment>
        <DangerousActionModal id={"attachmentDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onAttachmentDelete}
                              actionDescription={<div>Attachment will be permanently <u>deleted</u>.</div>} Icon={FaTrash}/>
        <div className={"my-1 text-black-75"}>Attached Files</div>
        {ideaData.attachments.map(attachment => {
            let userId = user.data.id;
            if (ideaData.user.id === userId || moderators.find(mod => mod.userId === userId)) {
                return <React.Fragment key={attachment.id}>
                    <UiElementDeleteButton tooltipName={"Remove"} id={"attachment-del"} onClick={() => doAttachmentDelete(attachment)}/>
                    <SafeAnchor url={attachment.url}>
                        <Attachment thumbnail src={attachment.url} alt={"Attachment"} width={125}/>
                    </SafeAnchor>
                </React.Fragment>
            }
            return <SafeAnchor key={attachment.id} url={attachment.url}>
                <UiImage thumbnail src={attachment.url} alt={"Attachment"} width={125}/>
            </SafeAnchor>
        })}
    </React.Fragment>
};

export default AttachmentsInfo;