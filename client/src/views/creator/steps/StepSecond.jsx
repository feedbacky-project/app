import React from 'react';
import {Col, Form, OverlayTrigger, Popover} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/fa";
import {getBase64FromFile, validateImageWithWarning} from "../../../components/util/Utils";

const StepSecond = (props) => {
    return <React.Fragment>
        <Col xs={12} className="mt-4 text-center">
            <img alt="" src="https://cdn.feedbacky.net/static/svg/undraw_brand_project.svg" className="my-2" width={150} height={150}/>
            <h2>Brand Your Board</h2>
            <span className="text-black-60">
                    Upload your board logo and banner. This step is required.
                </span>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <Form.Label className="mr-1 text-muted">Board Banner</Form.Label>
            <OverlayTrigger
                trigger="click"
                placement="top"
                rootClose={true}
                rootCloseEvent="click"
                overlay={
                    <Popover id="bannerPopover">
                        <Popover.Title as="h3">Set Board Banner</Popover.Title>
                        <Popover.Content>
                            Upload your board banner.
                            <br/>
                            <strong>
                                Maximum size 500 kb, png and jpg only.
                                <br/>
                                Suggested size: 1120x400
                            </strong>
                        </Popover.Content>
                    </Popover>
                }>
                <FaQuestionCircle className="fa-xs text-black-50"/>
            </OverlayTrigger>
            <br/>
            {/* simulate real board jumbotron to show properly sized image */}
            <div id="boardBanner" className="jumbotron mb-2" style={{backgroundImage: `url("` + props.banner + `")`}}>
                <h3 className="h3-responsive" style={{color: "transparent"}}>Feedbacky Board</h3>
                <h5 className="h5-responsive" style={{color: "transparent"}}>Feedbacky example Board</h5>
            </div>
            <input className="small" accept="image/jpeg, image/png" id="bannerInput" type="file" name="banner" onChange={e => onBannerChange(e, props)}/>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <Form.Label className="mr-1 text-muted">Board Logo</Form.Label>
            <OverlayTrigger
                trigger="click"
                placement="top"
                rootClose={true}
                rootCloseEvent="click"
                overlay={
                    <Popover id="logoPopover">
                        <Popover.Title as="h3">Set Board Logo</Popover.Title>
                        <Popover.Content>
                            Upload your board logo.
                            <br/>
                            <strong>
                                Maximum size 150 kb, png and jpg only.
                                <br/>
                                Suggested size: 100x100
                            </strong>
                        </Popover.Content>
                    </Popover>
                }>
                <FaQuestionCircle className="fa-xs text-black-50"/>
            </OverlayTrigger>
            <br/>
            <img alt="logo" src={props.logo} id="boardLogo" className="img-fluid mb-2" width="50px"/>
            <br/>
            <input className="small" accept="image/jpeg, image/png" id="logoInput" type="file" name="logo" onChange={e => onLogoChange(e, props)}/>
        </Col>
    </React.Fragment>
};

const onLogoChange = (e, props) => {
    if (!validateImageWithWarning(e, "logoInput", 250)) {
        return;
    }
    let file = e.target.files[0];
    getBase64FromFile(file).then(data => {
        document.getElementById("boardLogo").setAttribute("src", data);
        props.onSetupMethodCall("logo", data);
    });
};

const onBannerChange = (e, props) => {
    if (!validateImageWithWarning(e, "bannerInput", 650)) {
        return;
    }
    let file = e.target.files[0];
    getBase64FromFile(file).then(data => {
        document.getElementById("boardBanner").style["background-image"] = "url('" + data + "')";
        props.onSetupMethodCall("banner", data);
    });
};

export default StepSecond;