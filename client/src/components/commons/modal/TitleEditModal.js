import {IdeaContext} from "context";
import React, {useContext, useRef} from "react";
import {UiLoadableButton} from "ui/button";
import {UiFormControl, UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {formatRemainingCharacters, popupWarning} from "utils/basic-utils";

const TitleEditModal = ({isOpen, onHide, onAction}) => {
    const {ideaData} = useContext(IdeaContext);
    const ref = useRef();

    const onEdit = () => {
        const title = document.getElementById("titleTextarea").value;
        if (title.length < 10) {
            popupWarning("Title should be at least 10 characters long");
            return Promise.resolve();
        }
        return onAction(title).then(onHide);
    };
    const applyButton = <UiLoadableButton label={"Update"} onClick={onEdit} className={"mx-0"}>Update</UiLoadableButton>;
    const onTitleEdit = () => formatRemainingCharacters("remainingTitle", "titleTextarea", 50);
    return <UiDismissibleModal id={"titleUpdate"} size={"sm"} isOpen={isOpen} onHide={onHide} title={"Update Title"} applyButton={applyButton}
                               onEntered={() => ref.current && ref.current.focus()}>
        <div className={"mt-2 mb-1"}>
            <UiFormLabel>Title</UiFormLabel>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiCol xs={12} className={"d-inline-block px-0"}>
                        <UiFormControl innerRef={ref} minLength={10} maxLength={50} rows={1} type={"text"} defaultValue={ideaData.title} placeholder={"Brief and descriptive title."} id={"titleTextarea"}
                                       onChange={onTitleEdit} label={"Idea title"}/>
                    </UiCol>
                    <small className={"d-inline mt-1 float-left text-black-60"} id={"remainingTitle"}>
                        {50 - ideaData.title.length} Remaining
                    </small>
                </UiCol>
            </UiCol>
        </div>
    </UiDismissibleModal>
};

export default TitleEditModal;