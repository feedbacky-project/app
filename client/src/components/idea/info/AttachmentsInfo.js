import axios from "axios";
import SafeAnchor from "components/commons/SafeAnchor";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext} from "react";
import UiElementDeleteButton from "ui/button/UiElementDeleteButton";
import UiImage from "ui/image/UiImage";
import {toastError, toastSuccess} from "utils/basic-utils";
import {popupSwal} from "utils/sweetalert-utils";

const AttachmentsInfo = () => {
    const {user} = useContext(AppContext);
    const {moderators} = useContext(BoardContext).data;
    const {ideaData, updateState} = useContext(IdeaContext);
    if (ideaData.attachments.length === 0) {
        return <React.Fragment/>
    }
    const onAttachmentDelete = (attachment) => {
        popupSwal("warning", "Dangerous action", "This attachment will be permanently removed.",
            "Delete", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/attachments/" + attachment.id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    updateState({
                        ...ideaData,
                        attachments: ideaData.attachments.filter(data => data.url !== attachment.url)
                    });
                    toastSuccess("Attachment removed.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };
    //todo lightbox for attachments
    return <React.Fragment>
        <div className={"my-1 text-black-75"}>Attached Files</div>
        {ideaData.attachments.map(attachment => {
            let userId = user.data.id;
            if (ideaData.user.id === userId || moderators.find(mod => mod.userId === userId)) {
                return <React.Fragment key={attachment.id}>
                    <UiElementDeleteButton tooltipName={"Remove"} onClick={() => onAttachmentDelete(attachment)} id={"attachment-del"}/>
                    <SafeAnchor url={attachment.url}>
                        <UiImage className={"img-thumbnail"} src={attachment.url} alt={"Social Icon"} width={125}/>
                    </SafeAnchor>
                </React.Fragment>
            }
            return <SafeAnchor key={attachment.id} url={attachment.url}>
                <img width={125} className={"img-thumbnail"} alt={"attachment"} src={attachment.url}/>
            </SafeAnchor>
        })}
    </React.Fragment>
};

export default AttachmentsInfo;