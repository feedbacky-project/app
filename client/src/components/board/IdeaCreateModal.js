import styled from "@emotion/styled";
import axios from "axios";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import Form from "react-bootstrap/Form";
import {FaRegImage} from "react-icons/fa";
import tinycolor from "tinycolor2";
import UiClassicButton from "ui/button/UiClassicButton";
import UiElementDeleteButton from "ui/button/UiElementDeleteButton";
import UiLoadableButton from "ui/button/UiLoadableButton";
import UiCol from "ui/grid/UiCol";
import UiBadge from "ui/UiBadge";
import UiClickableTip from "ui/UiClickableTip";
import UiModal from "ui/UiModal";
import {formatRemainingCharacters, getBase64FromFile, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "utils/basic-utils";

const AttachmentButton = styled(UiClassicButton)`
  max-height: 38px;
  .dark & {
    background-color: var(--dark-secondary);
    & * {
      color: var(--dark-font-color);
    }
  }
`;

const IdeaCreateModal = ({isOpen, onHide, onIdeaCreation}) => {
    const appContext = useContext(AppContext);
    const {discriminator, tags} = useContext(BoardContext).data;
    const [title, setTitle] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState("No Attachment");
    const applicableTags = tags.filter(tag => tag.publicUse);

    const handleSubmit = () => {
        const description = document.getElementById("descriptionTextarea").value;
        if (title.length < 10) {
            toastWarning("Title should be at least 10 characters long.");
            return Promise.resolve();
        }
        if (description.length < 20) {
            toastWarning("Description should be at least 20 characters long.");
            return Promise.resolve();
        }
        let toastId = toastAwait("Posting idea...");
        const tags = [];
        if (applicableTags.length !== 0) {
            const applicable = document.querySelectorAll('[id^="applicableTag_"');
            applicable.forEach(tagObject => {
                if (tagObject.checked) {
                    tags.push(tagObject.id.replace("applicableTag_", ""));
                }
            })
        }
        return axios.post("/ideas/", {
            discriminator, title, description, attachment, tags
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            toastSuccess("Successfully posted new idea!", toastId);
            setTitle("");
            onHide();
            onIdeaCreation(res.data);
        }).catch(err => {
            if (err.response === undefined) {
                return;
            }
            err.response.data.errors.forEach(data => {
                toastWarning(data, toastId);
            });
        });
    };

    const renderAttachmentButton = () => {
        return <div className={"float-right"}>
            <UiCol xs={"auto"}  className={"d-inline-block px-0"}>
                <AttachmentButton className={"m-0 p-0"}>
                    <input accept={"image/jpeg, image/png"} type={"file"} className={"d-none"} id={"attachmentUpload"} onChange={onAttachmentUpload}/>
                    <label htmlFor={"attachmentUpload"} className={"mb-0 cursor-click"} style={{height: 38, width: 38, color: "hsl(210, 11%, 15%)"}}>
                        <FaRegImage className={"align-top cursor-click"} style={{position: "relative", top: "50%", transform: "translateY(-50%)"}}/>
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
    return <UiModal id={"ideaPost"} isOpen={isOpen} onHide={onHide} title={"Post Feedback"}
                    applyButton={<UiLoadableButton onClick={handleSubmit} className={"mx-0"}>Post Idea</UiLoadableButton>}>
        <div className={"mt-2 mb-1"}>
            <div className={"mb-2"}>
                <div className={"mr-1 d-inline"}>Title</div>
                <UiClickableTip id={"ideaTitle"} title={"Writing a Title"} description={"Keep longer than 10 and shorter than 50 characters."}/>
            </div>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={10} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <Form.Control style={{minHeight: 38, resize: "none"}} minLength={10} maxLength={50} rows={1}
                                  required type={"text"} defaultValue={title}
                                  placeholder={"Brief and descriptive title."} id={"titleTextarea"} onChange={e => {
                        formatRemainingCharacters("remainingTitle", "titleTextarea", 50);
                        setTitle(e.target.value.substring(0, 50));
                    }}/>
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
            <div className={"mb-2"}>
                <div className={"mr-1 d-inline"}>Description</div>
                <UiClickableTip id={"ideaDescription"} title={"Writing a Description"} description={<React.Fragment>
                    Write a detailed description of your feedback suggestion.<br/>
                    Supports <strong>**basic markdown**</strong> <em>*elements*</em>.<br/>
                    Please keep under 1800 characters.
                </React.Fragment>}/>
            </div>
            <TextareaAutosize className={"form-control"} id={"descriptionTextarea"} rows={5} maxRows={10}
                              placeholder={"Detailed and meaningful description."} minLength={10} maxLength={1800} required
                              as={"textarea"} style={{resize: "none", overflow: "hidden"}}
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
                <div className={"mb-2"}>
                    <div className={"d-inline mr-1"}>Tags</div>
                    <UiClickableTip id={"ideaTags"} title={"Choosing Tags"} description={<React.Fragment>
                        Choose tags you wish to be used in your idea.<br/>
                    </React.Fragment>}/>
                </div>
                <div>
                    {applicableTags.map((tag, i) => {
                        return <Form.Check id={"applicableTag_" + tag.id} key={i} custom inline label={<UiBadge color={tinycolor(tag.color)} text={tag.name} context={appContext}/>}
                                           type={"checkbox"} defaultChecked={false}/>
                    })}
                </div>
            </div>
        </React.Fragment>
        }
    </UiModal>
};

export default IdeaCreateModal;