import styled from "@emotion/styled";
import axios from "axios";
import {AppContext, BoardContext} from "context";
import React, {useContext, useRef, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {FaExternalLinkAlt, FaRegImage} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiBadge, UiThemeContext} from "ui";
import {UiClassicButton, UiElementDeleteButton, UiLoadableButton} from "ui/button";
import {UiFormControl, UiFormLabel, UiFormSelect, UiMarkdownFormControl} from "ui/form";
import {UiCol} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {formatRemainingCharacters, getBase64FromFile, popupError, popupNotification, popupWarning, validateImageWithWarning} from "utils/basic-utils";

const AttachmentButton = styled(UiClassicButton)`
  max-height: 36px;
  background-color: var(--secondary);
  color: hsla(0, 0%, 0%, .6);

  .dark & {
    & * {
      color: hsla(0, 0%, 95%, .6);
    }
  }
`;

const AttachmentName = styled.small`
  display: inline;
  width: 240px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: .25rem;
  float: right;

  @media (max-width: 576px) {
    width: 120px;
  }
  @media (max-width: 370px) {
    width: 90px;
  }
`;

const IdeaCreateModal = ({isOpen, onHide, onIdeaCreation, setSearchQuery}) => {
    const {getTheme} = useContext(UiThemeContext);
    const {user, onLocalPreferencesUpdate} = useContext(AppContext);
    const {discriminator, tags} = useContext(BoardContext).data;
    const [title, setTitle] = useState("");
    const [similarIdeas, setSimilarIdeas] = useState(0);
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState("No Attachment");
    const applicableTags = tags.filter(tag => tag.publicUse);
    const [chosenTags, setChosenTags] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const descriptionRef = useRef();

    const onCreate = () => {
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
            setDescription("");
            setAttachment(null);
            setAttachmentName("No Attachment");
            setChosenTags([]);
            setSimilarIdeas(0);
            onHide();
            onIdeaCreation(res.data);
        });
    };
    const renderAttachmentButton = () => {
        return <div className={"float-right"}>
            <UiCol xs={"auto"} className={"d-inline-block px-0"}>
                <AttachmentButton label={"Add Attachment"} variant={""} className={"m-0 p-0"}>
                    <input accept={"image/jpeg, image/png"} type={"file"} className={"d-none"} id={"attachmentUpload"} onChange={onAttachmentUpload}/>
                    <label htmlFor={"attachmentUpload"} className={"mb-0"} style={{display: "flex", cursor: "pointer", height: 36, width: 36, color: "hsl(210, 11%, 15%)"}}>
                        {attachment ? <img alt={attachmentName} src={attachment} width={"24"} className={"m-auto"}/> :
                            <FaRegImage className={"m-auto"}/>
                        }
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
    const fetchSimilarIdeas = (text) => {
        clearTimeout(searchTimeout);
        if (text === "") {
            return;
        }
        setSearchTimeout(setTimeout(() => axios.get("/boards/" + discriminator + "/ideas?filter=text:" + text).then(res => {
            const data = res.data.data;
            setSimilarIdeas(data.length);
        }), 500));
    }
    const applyButton = <UiLoadableButton label={"Post Idea"} onClick={onCreate} className={"mx-0"}>Post Idea</UiLoadableButton>;
    const onTitleChange = e => {
        formatRemainingCharacters("remainingTitle", "titleTextarea", 50);
        const text = e.target.value.substring(0, 50);
        setTitle(text);
        fetchSimilarIdeas(text);
    };
    const onDescriptionChange = e => {
        e.target.value = e.target.value.substring(0, 1800);
        formatRemainingCharacters("remainingDescription", "descriptionTextarea", 1800);
        setDescription(e.target.value.substring(0, 1800));
    };
    const onTagChange = changed => {
        setChosenTags(changed.map(option => applicableTags.find(t => t.id === option.value)));
    }
    return <UiDismissibleModal id={"ideaPost"} isOpen={isOpen} onHide={onHide} title={"Post Feedback"}
                               applyButton={applyButton} onEntered={() => descriptionRef.current && descriptionRef.current.focus()}>
        <div className={"mt-2 mb-1"}>
            <UiFormLabel>Title</UiFormLabel>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={10} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormControl innerRef={descriptionRef} minLength={10} maxLength={50} rows={1} type={"text"} defaultValue={title} placeholder={"Brief and descriptive title."} id={"titleTextarea"}
                                   onChange={onTitleChange} label={"Idea title"}/>
                </UiCol>
                {renderAttachmentButton()}
            </UiCol>
            <div>
                <div>
                    <small className={"d-inline mt-1 float-left text-black-60"} id={"remainingTitle"}>
                        50 Remaining
                    </small>
                    {
                        similarIdeas <= 0 ||
                        <a href={"#search"} className={"small d-inline mt-1 ml-1 float-left text-black-75"} onClick={() => {
                            onHide();
                            setSearchQuery(title);
                            onLocalPreferencesUpdate({...user.localPreferences, ideas: {...user.localPreferences.ideas, filter: "status:ALL", advanced: null}});
                        }}>· <FaExternalLinkAlt className={"align-baseline pt-1"}/> {similarIdeas} Similar Ideas</a>
                    }
                </div>
                <AttachmentName className={"text-black-60"}>
                    {attachmentName}
                </AttachmentName>
            </div>


        </div>
        <br/>
        <div className={"my-2"}>
            <UiFormLabel>Description</UiFormLabel>
            <UiMarkdownFormControl label={"Write description"} as={TextareaAutosize} defaultValue={description} id={"descriptionTextarea"} rows={5} maxRows={10}
                                   placeholder={"Detailed and meaningful description."} minLength={10} maxLength={1800} required
                                   style={{resize: "none", overflow: "hidden"}}
                                   onChange={onDescriptionChange}/>
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
                <UiFormSelect name={"tagSelector"} value={chosenTags.map(tag => ({value: tag.id, label: <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}))} isMulti options={applicableTags.map(tag => ({value: tag.id, label: <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}))}
                              onChange={onTagChange} placeholder={"Choose Tags"}
                              filterOption={(candidate, input) => {
                                  return candidate.data.__isNew__ || applicableTags.find(t => t.id === candidate.value).name.toLowerCase().includes(input.toLowerCase());
                              }}/>
            </div>
        </React.Fragment>
        }
        <div>

        </div>
    </UiDismissibleModal>
};

export default IdeaCreateModal;