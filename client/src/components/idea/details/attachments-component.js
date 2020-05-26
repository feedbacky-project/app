import React, {useContext} from "react";
import DeleteButton from "components/util/delete-button";
import SafeAnchor from "components/app/safe-anchor";
import AppContext from "context/app-context";
import {popupSwal} from "components/util/sweetalert-utils";
import axios from "axios";
import {toastError, toastSuccess} from "components/util/utils";
import BoardContext from "context/board-context";

const AttachmentsComponent = ({ideaData, updateState}) => {
    const context = useContext(AppContext);
    const {moderators} = useContext(BoardContext).data;
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
        <div className="my-1 text-black-75">Attached Files</div>
        {ideaData.attachments.map(attachment => {
            let userId = context.user.data.id;
            if (ideaData.user.id === userId || moderators.find(mod => mod.userId === userId)) {
                return <React.Fragment key={attachment.id}>
                    <DeleteButton tooltipName="Remove" onClick={() => onAttachmentDelete(attachment)} id="attachment-del"/>
                    <SafeAnchor url={attachment.url}>
                        <img width={125} className="img-thumbnail" alt="attachment" src={attachment.url}/>
                    </SafeAnchor>
                </React.Fragment>
            }
            return <SafeAnchor key={attachment.id} url={attachment.url}>
                <img width={125} className="img-thumbnail" alt="attachment" src={attachment.url}/>
            </SafeAnchor>
        })}
    </React.Fragment>
};

export default AttachmentsComponent;