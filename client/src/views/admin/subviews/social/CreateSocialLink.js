import React, {Component} from 'react';
import AppContext from "../../../../context/AppContext";
import StepFirst from "./steps/StepFirst";
import StepSecond from "./steps/StepSecond";
import {Button, Col, Container, ProgressBar, Row} from "react-bootstrap";
import {getSimpleRequestConfig, toastAwait, toastError, toastSuccess, toastWarning} from "../../../../components/util/Utils";
import axios from "axios";
import Steps, {Step} from "rc-steps";
import {Link, withRouter} from "react-router-dom";

import "../../../Steps.css";
import {FaAngleLeft, FaAngleRight} from "react-icons/all";

class CreateSocialLink extends Component {

    static contextType = AppContext;

    state = {
        step: 1,
        iconData: "",
        url: "",
        chosen: -1,
        customIcon: false,
    };

    render() {
        return <React.Fragment>
            <Container>
                <Row className="mt-5">
                    {this.renderContent()}
                </Row>
            </Container>
        </React.Fragment>
    }

    renderContent() {
        return <React.Fragment>
            <Col xs={12} className="d-none d-sm-block">
                <Steps direction="horizontal" size="small" progressDot current={this.state.step}>
                    <Step title="Choose Icon"/>
                    <Step title="Set Link"/>
                    <Step title="Finish" state="finish"/>
                </Steps>
            </Col>
            <Col xs={12} className="d-sm-none px-4">
                <small>Step {this.state.step}</small>
                <ProgressBar now={this.state.step * 33.3}/>
            </Col>
            {this.renderStep()}
            <Col xs={12} className="text-right mt-4">
                <Button variant="link" className="text-black-60" as={Link} to={"/ba/" + this.props.data.discriminator + "/social"}>Cancel</Button>
                {this.renderBackButton()}
                {this.renderNextButton()}
            </Col>
        </React.Fragment>
    }

    renderStep() {
        switch (this.state.step) {
            case 1:
                return <StepFirst onSetupMethodCall={this.onSetupMethodCall} chosen={this.state.chosen} customIcon={this.state.customIcon} iconData={this.state.iconData}/>;
            case 2:
                return <StepSecond onSetupMethodCall={this.onSetupMethodCall} banner={this.state.banner} logo={this.state.logo}/>;
            case 3:
                let toastId = toastAwait("Adding new social link...");
                axios.post(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/socialLinks", {
                    iconData: this.state.iconData,
                    url: this.state.url
                }, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 201) {
                        toastWarning("Couldn't add social link due to unknown error!", toastId);
                        return;
                    }
                    toastSuccess("Added new social link.", toastId);
                    this.props.history.push("/ba/" + this.props.data.discriminator + "/social");
                }).catch(err => {
                    toastError(err.response.data.errors[0], toastId);
                });
                return <StepSecond onSetupMethodCall={this.onSetupMethodCall} banner={this.state.banner} logo={this.state.logo}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                this.setState({step: 1});
                return <StepFirst onSetupMethodCall={this.onSetupMethodCall} chosen={this.state.chosen} customIcon={this.state.customIcon} iconData={this.state.iconData}/>;
        }
    }

    onSetupMethodCall = (type, value) => {
        switch (type) {
            case "iconData":
                this.setState({iconData: value});
                return;
            case "url":
                this.setState({url: value});
                return;
            case "customIcon":
                this.setState({customIcon: value});
                return;
            case "chosen":
                this.setState({chosen: value});
                return;
        }
    };

    renderBackButton() {
        if (this.state.step === 1) {
            return <React.Fragment/>
        }
        return <Button variant="" style={{backgroundColor: "#0994f6"}} className="text-white pl-1" onClick={this.previousStep}><FaAngleLeft/> Back</Button>
    }

    renderNextButton() {
        if (this.state.step >= 2) {
            return <Button variant="success" className="text-white" onClick={this.nextStep}>Finish</Button>
        }
        return <Button variant="" style={{backgroundColor: "#0994f6"}} className="text-white pr-1" onClick={this.nextStep}>Next <FaAngleRight/></Button>
    }

    previousStep = () => {
        this.setState({step: this.state.step - 1});
    };

    nextStep = () => {
        if (this.state.step === 1) {
            if (this.state.iconData === "") {
                toastWarning("Icon must be chosen.");
                return;
            }
        }
        this.setState({step: this.state.step + 1});
    };
}

export default withRouter(CreateSocialLink);