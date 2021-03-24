import styled from "@emotion/styled";
import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import SafeAnchor from "components/commons/SafeAnchor";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useState} from "react";
import {UiElementDeleteButton} from "ui/button";
import {UiImage} from "ui/image";
import {popupError, popupNotification} from "utils/basic-utils";

const Attachment = styled(UiImage)`
  .dark & {
    background-color: var(--dark-tertiary);
  }
`;

const AttachmentsInfo = () => {
    const {user, getTheme} = useContext(AppContext);
    const {moderators} = useContext(BoardContext).data;
    const {ideaData, updateState} = useContext(IdeaContext);
    const [modal, setModal] = useState({open: false, data: -1, dataUrl: ""});
    if (ideaData.attachments.length === 0) {
        return <React.Fragment/>
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
    //todo lightbox for attachments
    return <React.Fragment>
        <DangerousActionModal id={"attachmentDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onAttachmentDelete}
                              actionDescription={<div>Attachment will be permanently <u>deleted</u>.</div>}/>
        <div className={"my-1 text-black-75"}>Attached Files</div>
        {ideaData.attachments.map(attachment => {
            let userId = user.data.id;
            if (ideaData.user.id === userId || moderators.find(mod => mod.userId === userId)) {
                return <React.Fragment key={attachment.id}>
                    <UiElementDeleteButton tooltipName={"Remove"} id={"attachment-del"} onClick={() => setModal({open: true, data: attachment.id, dataUrl: attachment.url})}/>
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