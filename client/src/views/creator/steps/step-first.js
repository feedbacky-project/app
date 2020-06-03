import React from 'react';
import {Col, Form} from "react-bootstrap";
import {formatRemainingCharacters} from "components/util/utils";
import ClickableTip from "components/util/clickable-tip";
import UndrawCreateProject from "assets/svg/undraw/create_project.svg";

const StepFirst = ({updateSettings, settings}) => {
    return <React.Fragment>
        <Col xs={12} className="mt-4 text-center">
            <img alt="" src={UndrawCreateProject} className="my-2" width={150} height={150}/>
            <h2>Choose Name and Discriminator</h2>
            <span className="text-black-60">
                Type how your board will be named and discriminator under which users will access it on Feedbacky.
            </span>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <div className="text-black-60 mb-2">
                <span className="mr-1">Board Discriminator</span>
                <ClickableTip id="boardDiscriminator" title="Set Board Discriminator"
                              description={<React.Fragment>Must be an unique combination of alphanumeric characters.
                                  <br/>
                                  For example if your project is called My Awesome Project
                                  you can set your discriminator to <kbd>myawproj</kbd> or something similar
                                  <br/>
                                  <strong>Minimum 3 and maximum of 20 characters.</strong></React.Fragment>}/>
            </div>
            <Form.Control style={{minHeight: 38, resize: "none"}} minLength="3" maxLength="20" rows="1" required type="text"
                          placeholder="Short discriminator eg. my-project-123." id="discriminator" defaultValue={settings.discriminator}
                          onKeyUp={() => {
                              updateSettings({...settings, discriminator: document.getElementById("discriminator").value});
                              formatRemainingCharacters("remainingDiscriminator", "discriminator", 20);
                          }}/>
            <Form.Text className="text-right text-black-60" id="remainingDiscriminator">
                20 Remaining
            </Form.Text>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <div className="text-black-60 mb-2">
                <span className="mr-1">Board Name</span>
                <ClickableTip id="boardName" title="Set Board Name" description="Name of your board should be at least 4 and maximum 25 characters long."/>
            </div>
            <Form.Control style={{minHeight: 38, resize: "none"}} minLength="4" maxLength="25" rows="1" required type="text"
                          placeholder="Short name of board." id="name" defaultValue={settings.name}
                          onKeyUp={() => {
                              updateSettings({...settings, name: document.getElementById("name").value});
                              formatRemainingCharacters("remainingName", "name", 25);
                          }}/>
            <Form.Text className="text-right text-black-60" id="remainingName">
                25 Remaining
            </Form.Text>
        </Col>
    </React.Fragment>
};

export default StepFirst;