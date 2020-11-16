import React, {useContext, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {formatRemainingCharacters, toastError, toastSuccess, toastWarning} from "components/util/utils";
import AppContext from "context/app-context";
import PageModal from "components/modal/page-modal";
import ClickableTip from "components/util/clickable-tip";
import {Col, Row} from "react-bootstrap";
import ColorSelectionHelper from "components/modal/color-selection-helper";
import ExecutableButton from "components/app/executable-button";

const TagCreateModal = (props) => {
    const context = useContext(AppContext);
    const [color, setColor] = useState("#0994f6");

    const handleSubmit = () => {
        const name = document.getElementById("tagNameTextarea").value;
        if (name.length < 3 || name.length > 20) {
            toastWarning("Tag name must be between 3 and 20 characters.");
            return Promise.resolve();
        }
        const roadmapIgnored = document.getElementById("roadmapIgnored").checked;
        return axios.post("/boards/" + props.data.discriminator + "/tags", {
            name, color, roadmapIgnored,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            props.onTagCreateModalClose();
            props.onTagCreate(name, color, roadmapIgnored);
            toastSuccess("Tag with name " + name + " created.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    return <PageModal id="tagCreate" isOpen={props.open} onHide={props.onTagCreateModalClose} title="Add new Tag"
                      applyButton={<ExecutableButton variant=""  style={{backgroundColor: context.getTheme()}} onClick={handleSubmit} className="mx-0">Save</ExecutableButton>}>
        <Row>
            <Col xs={12} className="mt-2 mb-1">
                <Form.Label className="mr-1 text-black-60">Tag Name</Form.Label>
                <ClickableTip id="tagName" title="Tag Name" description="Descriptive and under 20 characters name of tag."/>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="2" maxLength="15" rows="1" required type="text"
                              placeholder="Short and descriptive." id="tagNameTextarea" onKeyUp={() => formatRemainingCharacters("remainingTag", "tagNameTextarea", 15)}/>
                <Form.Text className="text-right text-black-60" id="remainingTag">
                    15 Remaining
                </Form.Text>
            </Col>
            <Col xs={12} sm={6} className="mb-2">
                <ColorSelectionHelper title="Tag Color" color={color} setColor={setColor} colorWarning={true}/>
            </Col>
            <Col xs={12} sm={6} className="mb-2">
                <Form.Label className="mr-1 text-black-60">Ignore Roadmap</Form.Label>
                <ClickableTip id="tagColor" title="Ignore Roadmap" description="Select if you don't want to include show tag and ideas with this tag in roadmap view."/>
                <br/>
                <Form.Check id="roadmapIgnored" custom inline label="Roadmap Ignored" type="checkbox" defaultChecked={false}/>
            </Col>
        </Row>
    </PageModal>
};

export default TagCreateModal;