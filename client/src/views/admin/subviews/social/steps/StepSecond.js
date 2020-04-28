import React from 'react';
import {Col, Form} from "react-bootstrap";

const StepSecond = (props) => {
    return <React.Fragment>
        <Col xs={12} className="mt-4 text-center">
            <img alt="" src="https://cdn.feedbacky.net/static/svg/undraw_typewriter.svg" className="my-2" width={150} height={150}/>
            <h2>Set Logo Link</h2>
            <span className="text-black-60">
                    Set URL your social link will redirect to.
                </span>
        </Col>
        <Col sm={12} md={8} xl={6} className="offset-xl-3 offset-md-2 mt-4 px-md-5 px-3">
            <div className="text-black-60 mb-2">
                Social URL
            </div>
            <Form.Control style={{maxHeight: 38, resize: "none"}} rows="1" required type="text"
                          placeholder="URL to target site, include http/https:// state." id="url" defaultValue={props.url}
                          onChange={() => props.onSetupMethodCall("url", document.getElementById("url").value)}/>
        </Col>
    </React.Fragment>
};

export default StepSecond;