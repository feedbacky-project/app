import React, {lazy, Suspense, useContext, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {formatRemainingCharacters, getSimpleRequestConfig, toastError, toastSuccess, toastWarning} from "../util/utils";
import AppContext from "../../context/app-context";
import LoadingSpinner from "../util/loading-spinner";
import {retry} from "../util/lazy-init";
import PageModal from "./page-modal";
import ClickableTip from "../util/clickable-tip";

const ChromePicker = lazy(() => retry(() => import ("react-color").then(module => ({default: module.ChromePicker}))));

const TagCreateModal = (props) => {
    const context = useContext(AppContext);
    const [color, setColor] = useState("#0994f6");

    const handleSubmit = () => {
        const name = document.getElementById("tagNameTextarea").value;
        if (name.length < 3 || name.length > 20) {
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
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    return <PageModal id="tagCreate" isOpen={props.open} onHide={props.onTagCreateModalClose} title="Add new Tag"
                      applyButton={<Button variant="" type="submit" style={{backgroundColor: context.theme}} onClick={handleSubmit} className="btn-smaller text-white">Create New</Button>}>
        <Form noValidate>
            <Form.Group className="mt-2 mb-1">
                <Form.Label className="mr-1 text-black-60">Tag Name</Form.Label>
                <ClickableTip id="tagName" title="Tag Name" description="Descriptive and under 20 characters name of tag."/>
                <Form.Control style={{maxHeight: 38, resize: "none"}} minLength="2" maxLength="15" rows="1" required type="text"
                              placeholder="Short and descriptive." id="tagNameTextarea" onKeyUp={() => formatRemainingCharacters("remainingTag", "tagNameTextarea", 15)}/>
                <Form.Text className="text-right text-black-60" id="remainingTag">
                    15 Remaining
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Label className="mr-1 text-black-60">Tag Color</Form.Label>
                <ClickableTip id="tagColor" title="Tag Color" description="Choose color of the tag. Avoid bright colors, poorly visible both in Light and Dark Themes."/>
                <br/>
                <Suspense fallback={<LoadingSpinner/>}>
                    <ChromePicker className="text-center" disableAlpha color={color} onChangeComplete={changedColor => setColor(changedColor.hex)}/>
                </Suspense>
            </Form.Group>
        </Form>
    </PageModal>
};

export default TagCreateModal;