import React, {useContext, useState} from 'react';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {FaRegImage} from "react-icons/fa";
import {formatRemainingCharacters, getBase64FromFile, getSimpleRequestConfig, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "../util/utils";
import AppContext from "../../context/app-context";
import axios from "axios";
import TextareaAutosize from "react-autosize-textarea";
import {FaTimesCircle} from "react-icons/all";
import PageModal from "./page-modal";
import ClickableTip from "../util/clickable-tip";

const IdeaCreateModal = (props) => {
    const context = useContext(AppContext);
    const [title, setTitle] = useState("");
    const [timeoutVal, setTimeoutVal] = useState(null);
    const [similarIdeas, setSimilarIdeas] = useState([]);
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState("No Attachment");

    const handleSubmit = () => {
        const description = document.getElementById("descriptionTextarea").value;
        let toastId = toastAwait("Posting idea...");
        axios.post(context.apiRoute + "/ideas/", {
            discriminator: props.discriminator,
            title,
            description: description,
            attachment: attachment,
        }, getSimpleRequestConfig(context.user.session)).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            toastSuccess("Successfully posted new idea!", toastId);
            setTitle("");
            props.onCreateIdeaModalClose();
            props.onIdeaCreation(res.data);
        }).catch(err => {
            if (err.response === undefined) {
                return;
            }
            err.response.data.errors.forEach(data => {
                if (data.includes("Field 'title' cannot be shorter")) {
                    toastWarning("Title must be longer than 10 characters.", toastId);
                } else if (data.includes("Field 'description' cannot be shorter")) {
                    toastWarning("Description must be longer than 20 characters.", toastId);
                } else {
                    toastWarning(data, toastId);
                }
            });
        });
    };

    const renderAttachmentButton = () => {
        return <React.Fragment>
            <Button variant="attachment" className="col-1 align-top d-inline-block m-0 p-0 btn-smaller" style={{height: 38}}>
                <input accept="image/jpeg, image/png" type="file" className="d-none" id="attachmentUpload" onChange={onAttachmentUpload}/>
                <label htmlFor="attachmentUpload" className="mb-0 p-2"><FaRegImage className="fa-attachment"/></label>
            </Button>
            {attachment != null ? <FaTimesCircle className="cursor-click grey lighten-2 black-text rounded-circle" onClick={() => {
                setAttachment(null);
                setAttachmentName("No Attachment");
            }} style={{position: "absolute", left: "100%", transform: "translate(-10px,-8px)"}}/> : ""}
        </React.Fragment>
    };

    //todo
    const renderSimilarIdeas = () => {
        return <React.Fragment/>;
        /*if (similarIdeas.length === 0) {
            return <React.Fragment/>;
        }
        return <React.Fragment>
            <br/>
            <div>Similar Ideas</div>
            {similarIdeas.map(idea => {
                return <div>{idea.title}</div>;
            })}
        </React.Fragment>*/
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

    return <PageModal id="ideaPost" isOpen={props.open} onHide={props.onCreateIdeaModalClose} title="Post Feedback"
                      applyButton={<Button variant="" style={{backgroundColor: context.theme}} onClick={handleSubmit} className="btn-smaller text-white">Post Idea</Button>}>
        <Form noValidate onSubmit={e => e.preventDefault()}>
            <Form.Group className="mt-2 mb-1">
                <Form.Label className="mr-1">Title</Form.Label>
                <ClickableTip id="ideaTitle" title="Writing a Title" description="Keep longer than 10 and shorter than 50 characters."/>
                <br/>
                <div className="col-12 d-inline-block px-0">
                    <div className="col-11 pr-3 px-0 d-inline-block">
                        <Form.Control style={{maxHeight: 38, resize: "none"}} minLength="10" maxLength="50" rows="1" required type="text" defaultValue={title}
                                      placeholder="Brief and descriptive title." id="titleTextarea" onKeyUp={e => {
                            formatRemainingCharacters("remainingTitle", "titleTextarea", 50);
                            setTitle(e.target.value);
                            //todo bring me back one day
                            /*clearTimeout(timeoutVal);
                            setTimeoutVal(setTimeout(() => {
                                axios.get(context.apiRoute + "/boards/" + props.discriminator + "/ideas?query=" + title)
                                    .then(res => setSimilarIdeas(res.data.data))
                            }, 500));*/
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
                <TextareaAutosize className="form-control" id="descriptionTextarea" rows={3} maxRows={9}
                                  placeholder="Detailed description." minLength="10" maxLength="1800" required as="textarea"
                                  style={{resize: "none", overflow: "hidden"}} onKeyUp={() => formatRemainingCharacters("remainingDescription", "descriptionTextarea", 1800)}/>
                <Form.Text className="d-inline float-left text-black-60" id="remainingDescription">
                    1800 Remaining
                </Form.Text>
                <Form.Text className="d-inline float-right text-black-60 d-inline">
                    Markdown Supported
                </Form.Text>
            </Form.Group>
            {renderSimilarIdeas()}
        </Form>
    </PageModal>
};

export default IdeaCreateModal;