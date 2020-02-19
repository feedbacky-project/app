import React, {lazy, Suspense, useContext, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {OverlayTrigger, Popover} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {FaQuestionCircle} from "react-icons/fa";
import axios from "axios";
import {formatRemainingCharacters, getSimpleRequestConfig, toastError, toastSuccess, toastWarning} from "../util/Utils";
import AppContext from "../../context/AppContext";
import LoadingSpinner from "../util/LoadingSpinner";
import {retry} from "../util/LazyInit";

const ChromePicker = lazy(() => retry(() => import ("react-color").then(module => ({default: module.ChromePicker}))));

const TagCreateModal = (props) => {
    const context = useContext(AppContext);
    const [color, setColor] = useState("#0994f6");

    const handleSubmit = () => {
        const name = document.getElementById("tagNameTextarea").value;
        if(name.length < 3 || name.length > 20) {
            toastWarning("Tag name must be between 3 and 20 characters.");
            return;
        }
        axios.post(context.apiRoute + "/boards/" + props.data.discriminator + "/tags", {
            name, color,
        }, getSimpleRequestConfig(context.user.session)).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            props.onTagCreateModalClose();
            props.onTagCreate(name, color);
            toastSuccess("Tag with name " + name + " created.");
        }).catch(err => {
            toastError(err.response.data.errors[0]);
        });
    };

    return <Modal id="ideaPostModal" show={props.open} onHide={props.onTagCreateModalClose}>
        <Modal.Header className="text-center pb-0" style={{display: "block", borderBottom: "none"}}>
            <Modal.Title><h5 className="modal-title">Add new Tag</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-1">
            <Form noValidate>
                <Form.Group className="mt-2 mb-1">
                    <Form.Label className="mr-1 text-black-60">Tag Name</Form.Label>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="tagNamePopover">
                                <Popover.Title as="h3">Tag Name</Popover.Title>
                                <Popover.Content>
                                    Descriptive and under 20 characters name of tag.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <Form.Control style={{maxHeight: 38, resize: "none"}} minLength="2" maxLength="15" rows="1" required type="text"
                                  placeholder="Short and descriptive." id="tagNameTextarea" onKeyUp={() => formatRemainingCharacters("remainingTag", "tagNameTextarea", 15)}/>
                    <Form.Text className="text-right text-black-60" id="remainingTag">
                        15 Remaining
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label className="mr-1 text-black-60">Tag Color</Form.Label>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="themePopover">
                                <Popover.Title as="h3">Tag Color</Popover.Title>
                                <Popover.Content>
                                    Color of the tag.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <br/>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <ChromePicker className="text-center" disableAlpha color={color} onChangeComplete={color => setColor(color.hex)}/>
                    </Suspense>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer style={{borderTop: "none"}} className="pt-0">
            <Button variant="link" className="m-0 btn-smaller text-black-60" onClick={props.onTagCreateModalClose}>
                Cancel
            </Button>
            <Button variant="" type="submit" style={{backgroundColor: context.theme}}
                    onClick={handleSubmit} className="btn-smaller text-white">
                Create New
            </Button>
        </Modal.Footer>
    </Modal>
};

export default TagCreateModal;