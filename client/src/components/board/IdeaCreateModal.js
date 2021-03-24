import styled from "@emotion/styled";
import axios from "axios";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {FaRegImage} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiBadge, UiClickableTip, UiLabelledCheckbox} from "ui";
import {UiClassicButton, UiElementDeleteButton, UiLoadableButton} from "ui/button";
import {UiFormControl, UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {formatRemainingCharacters, getBase64FromFile, popupError, popupNotification, popupWarning, validateImageWithWarning} from "utils/basic-utils";

const AttachmentButton = styled(UiClassicButton)`
  max-height: 38px;
  background-color: var(--secondary);
  .dark & {
    background-color: var(--dark-secondary);
    & * {
      color: var(--dark-font-color);
    }
  }
`;

const IdeaCreateModal = ({isOpen, onHide, onIdeaCreation}) => {
    const {getTheme} = useContext(AppContext);
    const {discriminator, tags} = useContext(BoardContext).data;
    const [title, setTitle] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState("No Attachment");
    const applicableTags = tags.filter(tag => tag.publicUse);
    const [chosenTags, setChosenTags] = useState([]);

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
        const tags = [];
        if (applicableTags.length !== 0) {
            chosenTags.forEach(tag => {
                tags.push(tag.id);
            });
        }
        return axios.post("/ideas/", {
            discriminator, title, description, attachment, tags
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            popupNotification("Idea posted", getTheme());
            setTitle("");
            onHide();
            onIdeaCreation(res.data);
        });
    };

    const renderAttachmentButton = () => {
        return <div className={"float-right"}>
            <UiCol xs={"auto"} className={"d-inline-block px-0"}>
                <AttachmentButton label={"Add Attachment"} variant={""} className={"m-0 p-0"}>
                    <input accept={"image/jpeg, image/png"} type={"file"} className={"d-none"} id={"attachmentUpload"} onChange={onAttachmentUpload}/>
                    <label htmlFor={"attachmentUpload"} className={"mb-0"} style={{cursor: "pointer", height: 38, width: 38, color: "hsl(210, 11%, 15%)"}}>
                        <FaRegImage className={"align-top"} style={{position: "relative", top: "50%", transform: "translateY(-50%)"}}/>
                    </label>
                </AttachmentButton>
            </UiCol>
            {attachment != null ? <UiElementDeleteButton id={"attachment-del"} tooltipName={"Remove"} onClick={() => {
                setAttachment(null);
                setAttachmentName("No Attachment");
            }}/> : ""}
        </div>
    };

    const onAttachmentUpload = (e) => {
        if (!validateImageWithWarning(e, "attachmentUpload", 1024)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            setAttachment(data);
            setAttachmentName(file.name);
        });
    };
    return <UiDismissibleModal id={"ideaPost"} isOpen={isOpen} onHide={onHide} title={"Post Feedback"}
                               applyButton={<UiLoadableButton label={"Post Idea"} onClick={handleSubmit} className={"mx-0"}>Post Idea</UiLoadableButton>}>
        <div className={"mt-2 mb-1"}>
            <UiFormLabel>Title</UiFormLabel>
            <UiClickableTip id={"ideaTitle"} title={"Writing a Title"} description={"Keep longer than 10 and shorter than 50 characters."}/>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={10} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormControl minLength={10} maxLength={50} rows={1} type={"text"} defaultValue={title} placeholder={"Brief and descriptive title."} id={"titleTextarea"}
                                   onChange={e => {
                                       formatRemainingCharacters("remainingTitle", "titleTextarea", 50);
                                       setTitle(e.target.value.substring(0, 50));
                                   }} label={"Idea title"}/>
                </UiCol>
                {renderAttachmentButton()}
            </UiCol>
            <small className={"d-inline mt-1 float-left text-black-60"} id={"remainingTitle"}>
                50 Remaining
            </small>
            <small className={"d-inline mt-1 float-right text-black-60"}>
                {attachmentName}
            </small>
        </div>
        <br/>
        <div className={"my-2"}>
            <UiFormLabel>Description</UiFormLabel>
            <UiClickableTip id={"ideaDescription"} title={"Writing a Description"} description={<React.Fragment>
                Write a detailed description of your feedback suggestion.<br/>
                Supports <strong>**basic markdown**</strong> <em>*elements*</em>.<br/>
                Please keep under 1800 characters.
            </React.Fragment>} aria-label={"Idea description"}/>
            <UiFormControl label={"Write description"} as={TextareaAutosize} id={"descriptionTextarea"} rows={5} maxRows={10}
                           placeholder={"Detailed and meaningful description."} minLength={10} maxLength={1800} required
                           style={{resize: "none", overflow: "hidden"}}
                           onChange={e => {
                               e.target.value = e.target.value.substring(0, 1800);
                               formatRemainingCharacters("remainingDescription", "descriptionTextarea", 1800);
                           }}/>
            <small className={"d-inline mt-1 float-left text-black-60"} id={"remainingDescription"}>
                1800 Remaining
            </small>
            <small className={"d-inline mt-1 float-right text-black-60"}>
                Markdown Supported
            </small>
        </div>
        {applicableTags.length === 0 || <React.Fragment>
            <br/>
            <div className={"my-2"}>
                <UiFormLabel>Tags</UiFormLabel>
                <UiClickableTip id={"ideaTags"} title={"Choosing Tags"} description={"Choose tags you wish to be used in your idea."}/>
                <div>
                    {applicableTags.map((tag, i) => {
                        const update = () => {
                            let newTags;
                            if (chosenTags.includes(tag)) {
                                newTags = chosenTags.filter(t => t.name !== tag.name);
                            } else {
                                newTags = chosenTags.concat(tag);
                            }
                            // https://stackoverflow.com/a/39225750/10156191
                            setTimeout(() => setChosenTags(newTags), 0);
                        };
                        return <UiLabelledCheckbox id={"applicableTag_" + tag.id} key={i} checked={chosenTags.includes(tag)} onChange={update} className={"mr-3"}
                                                   label={<UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}/>
                    })}
                </div>
            </div>
        </React.Fragment>
        }
    </UiDismissibleModal>
};

export default IdeaCreateModal;