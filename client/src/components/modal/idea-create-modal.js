import React, {useContext, useState} from 'react';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {FaRegImage} from "react-icons/fa";
import {formatRemainingCharacters, getBase64FromFile, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "components/util/utils";
import AppContext from "context/app-context";
import axios from "axios";
import TextareaAutosize from "react-autosize-textarea";
import PageModal from "components/modal/page-modal";
import ClickableTip from "components/util/clickable-tip";
import DeleteButton from "components/util/delete-button";
import BoardContext from "context/board-context";
import ExecutableButton from "components/app/executable-button";

const IdeaCreateModal = ({open, onCreateIdeaModalClose, onIdeaCreation}) => {
    const {getTheme} = useContext(AppContext);
    const {discriminator} = useContext(BoardContext).data;
    const [title, setTitle] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState("No Attachment");

    const handleSubmit = () => {
        const description = document.getElementById("descriptionTextarea").value;
        let toastId = toastAwait("Posting idea...");
        return axios.post("/ideas/", {
            discriminator, title, description, attachment
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            toastSuccess("Successfully posted new idea!", toastId);
            setTitle("");
            onCreateIdeaModalClose();
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
        return <React.Fragment>
            <Button variant="attachment" className="col-1 align-top d-inline-block m-0 p-0" style={{height: 38}}>
                <input accept="image/jpeg, image/png" type="file" className="d-none" id="attachmentUpload" onChange={onAttachmentUpload}/>
                <label htmlFor="attachmentUpload" className="mb-0 p-2"><FaRegImage className="fa-attachment"/></label>
            </Button>
            {attachment != null ? <DeleteButton id="attachment-del" tooltipName="Remove" onClick={() => {
                setAttachment(null);
                setAttachmentName("No Attachment");
            }}/> : ""}
        </React.Fragment>
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

    return <PageModal id="ideaPost" isOpen={open} onHide={onCreateIdeaModalClose} title="Post Feedback"
                      applyButton={<ExecutableButton variant="" style={{backgroundColor: getTheme()}} onClick={handleSubmit}
                                                     className="mx-0">Post Idea</ExecutableButton>}>
        <Form noValidate onSubmit={e => e.preventDefault()}>
            <Form.Group className="mt-2 mb-1">
                <Form.Label className="mr-1">Title</Form.Label>
                <ClickableTip id="ideaTitle" title="Writing a Title"
                              description="Keep longer than 10 and shorter than 50 characters."/>
                <br/>
                <div className="col-12 d-inline-block px-0">
                    <div className="col-11 pr-3 px-0 d-inline-block">
                        <Form.Control style={{minHeight: 38, resize: "none"}} minLength="10" maxLength="50" rows="1"
                                      required type="text" defaultValue={title}
                                      placeholder="Brief and descriptive title." id="titleTextarea" onKeyUp={e => {
                            formatRemainingCharacters("remainingTitle", "titleTextarea", 50);
                            setTitle(e.target.value);
                        }}/>
                    </div>
                    {renderAttachmentButton()}
                </div>
                <Form.Text className="d-inline float-left text-black-60" id="remainingTitle">
                    50 Remaining
                </Form.Text>
                <Form.Text className="d-inline float-right text-black-60">
                    {attachmentName}
                </Form.Text>
            </Form.Group>
            <br/>
            <Form.Group className="my-2">
                <Form.Label className="mr-1">Description</Form.Label>
                <ClickableTip id="ideaDescription" title="Writing a Description" description={<React.Fragment>
                    Write a detailed description of your feedback suggestion.<br/>
                    Supports <strong>**basic markdown**</strong> <em>*elements*</em>.<br/>
                    Please keep under 1800 characters.
                </React.Fragment>}/>
                <TextareaAutosize className="form-control" id="descriptionTextarea" rows={5} maxRows={10}
                                  placeholder="Detailed and meaningful description." minLength="10" maxLength="1800" required
                                  as="textarea" style={{resize: "none", overflow: "hidden"}}
                                  onKeyUp={() => formatRemainingCharacters("remainingDescription", "descriptionTextarea", 1800)}/>
                <Form.Text className="d-inline float-left text-black-60" id="remainingDescription">
                    1800 Remaining
                </Form.Text>
                <Form.Text className="d-inline float-right text-black-60 d-inline">
                    Markdown Supported
                </Form.Text>
            </Form.Group>
        </Form>
    </PageModal>
};

export default IdeaCreateModal;