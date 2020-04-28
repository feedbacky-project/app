import React from 'react';
import {Col, Form, OverlayTrigger, Popover} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/fa";
import {formatRemainingCharacters} from "../../../components/util/utils";

const StepFirst = (props) => {
    return <React.Fragment>
        <Col xs={12} className="mt-4 text-center">
            <img alt="" src="https://cdn.feedbacky.net/static/svg/undraw_create_project.svg" className="my-2" width={150} height={150}/>
            <h2>Choose Name and Discriminator</h2>
            <span className="text-black-60">
                    Type how your board will be named and discriminator under which users will access it on Feedbacky.
                </span>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <div className="text-black-60 mb-2">
                Board Discriminator
                <OverlayTrigger
                    trigger="click"
                    placement="bottom"
                    rootClose={true}
                    rootCloseEvent="click"
                    overlay={
                        <Popover id="boardNamePopover">
                            <Popover.Title as="h3">Set Board Discriminator</Popover.Title>
                            <Popover.Content>
                                Must be an unique combination of alphanumeric characters.
                                <br/>
                                For example if your project is called My Awesome Project
                                you can set your discriminator to <kbd>myawproj</kbd> or something similar
                                <br/>
                                <strong>Minimum 3 and maximum of 20 characters.</strong>
                            </Popover.Content>
                        </Popover>
                    }>
                    <FaQuestionCircle className="fa-xs text-black-50 ml-1"/>
                </OverlayTrigger>
            </div>
            <Form.Control style={{maxHeight: 38, resize: "none"}} minLength="3" maxLength="20" rows="1" required type="text"
                          placeholder="Short discriminator eg. my-project-123." id="discriminator" defaultValue={props.discriminator}
                          onKeyUp={() => onValueInput("discriminator", "remainingDiscriminator", 20, props)}/>
            <Form.Text className="text-right text-black-60" id="remainingDiscriminator">
                20 Remaining
            </Form.Text>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <div className="text-black-60 mb-2">
                Board Name
                <OverlayTrigger
                    trigger="click"
                    placement="top"
                    rootClose={true}
                    rootCloseEvent="click"
                    overlay={
                        <Popover id="boardNamePopover">
                            <Popover.Title as="h3">Set Board Name</Popover.Title>
                            <Popover.Content>
                                Name of your board should be at least 4 and maximum 25 characters long.
                            </Popover.Content>
                        </Popover>
                    }>
                    <FaQuestionCircle className="fa-xs text-black-50 ml-1"/>
                </OverlayTrigger>
            </div>
            <Form.Control style={{maxHeight: 38, resize: "none"}} minLength="4" maxLength="25" rows="1" required type="text"
                          placeholder="Short name of board." id="name" defaultValue={props.name}
                          onKeyUp={() => onValueInput("name", "remainingName", 25, props)}/>
            <Form.Text className="text-right text-black-60" id="remainingName">
                25 Remaining
            </Form.Text>
        </Col>
    </React.Fragment>
};

const onValueInput = (elementId, remainingId, limit, props) => {
    props.onSetupMethodCall(elementId, document.getElementById(elementId).value);
    formatRemainingCharacters(remainingId, elementId, limit);
};

export default StepFirst;