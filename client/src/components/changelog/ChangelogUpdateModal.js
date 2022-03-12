import axios from "axios";
import React, {useContext, useRef, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {UiThemeContext} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormControl, UiFormLabel, UiMarkdownFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {formatRemainingCharacters, htmlDecodeEntities, popupError, popupNotification, popupWarning} from "utils/basic-utils";

const ChangelogUpdateModal = ({isOpen, onHide, changelog, onChangelogUpdate}) => {
    const {getTheme} = useContext(UiThemeContext);
    const [title, setTitle] = useState(changelog.title);
    const ref = useRef();

    const handleSubmit = () => {
        const description = document.getElementById("descriptionTextarea").value;
        if (title.length < 10) {
            popupWarning("Title should be at least 10 characters long");
            return Promise.resolve();
        }
        if (description.length < 20) {
            popupWarning("Description should be at least 20 characters long");
            return Promise.resolve();
        }
        return axios.patch("/changelogs/" + changelog.id, {
            title, description
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            popupNotification("Changelog updated", getTheme());
            onHide();
            onChangelogUpdate(res.data);
        });
    };
    const applyButton = <UiLoadableButton label={"Update Changelog"} onClick={handleSubmit} className={"mx-0"}>Update Changelog</UiLoadableButton>;
    const onTitleChange = e => {
        formatRemainingCharacters("remainingTitle", "titleTextarea", 70);
        setTitle(e.target.value.substring(0, 70));
    }
    const onDescriptionChange = e => {
        e.target.value = e.target.value.substring(0, 2500);
        formatRemainingCharacters("remainingDescription", "descriptionTextarea", 2500);
    };
    return <UiDismissibleModal id={"changelogPost"} isOpen={isOpen} onHide={onHide} title={"Update Changelog"} onEntered={() => ref.current && ref.current.focus()}
                               applyButton={applyButton}>
        <div className={"mt-2 mb-1"}>
            <UiFormLabel>Title</UiFormLabel>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormControl minLength={10} maxLength={70} rows={1} type={"text"} defaultValue={title} placeholder={"Brief and descriptive title."} id={"titleTextarea"}
                                   onChange={onTitleChange} label={"Idea title"} innerRef={ref}/>
                </UiCol>
            </UiCol>
            <small className={"d-inline mt-1 float-left text-black-60"} id={"remainingTitle"}>
                {70 - changelog.title.length} Remaining
            </small>
        </div>
        <br/>
        <div className={"my-2"}>
            <UiFormLabel>Description</UiFormLabel>
            <UiMarkdownFormControl label={"Write description"} as={TextareaAutosize} defaultValue={htmlDecodeEntities(changelog.description)} id={"descriptionTextarea"} rows={5} maxRows={10}
                                   placeholder={"Detailed and meaningful description."} minLength={10} maxLength={2500} required
                                   style={{resize: "none", overflow: "hidden"}}
                                   onChange={onDescriptionChange}/>
            <small className={"d-inline mt-1 float-left text-black-60"} id={"remainingDescription"}>
                {2500 - changelog.description.length} Remaining
            </small>
            <small className={"d-inline mt-1 float-right text-black-60"}>
                Markdown Supported
            </small>
        </div>
    </UiDismissibleModal>
};

export default ChangelogUpdateModal;