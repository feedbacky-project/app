import React, {Component} from 'react';
import AppContext from "../../../../context/app-context";
import {Button, Col, Container, ProgressBar, Row} from "react-bootstrap";
import Steps, {Step} from "rc-steps";
import {Link, withRouter} from "react-router-dom";
import StepFirst from "./steps/step-first";
import StepSecond from "./steps/step-second";
import {getSimpleRequestConfig, toastAwait, toastError, toastSuccess, toastWarning} from "../../../../components/util/utils";
import axios from "axios";
import StepThird from "./steps/step-third";

import "../../../Steps.css";
import {FaAngleLeft, FaAngleRight} from "react-icons/all";

class CreateWebhook extends Component {

    static contextType = AppContext;

    state = {
        step: 1,
        type: "",
        listenedEvents: [],
        url: "",
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
                    <Step title="Select Type"/>
                    <Step title="Choose Events"/>
                    <Step title="Set URL"/>
                    <Step title="Finish" state="finish"/>
                </Steps>
            </Col>
            <Col xs={12} className="d-sm-none px-4">
                <small>Step {this.state.step}</small>
                <ProgressBar now={this.state.step * 25}/>
            </Col>
            {this.renderStep()}
            <Col xs={12} className="text-right mt-4">
                <Button variant="link" className="text-black-60" as={Link} to={"/ba/" + this.props.data.discriminator + "/webhooks"}>Cancel</Button>
                {this.renderBackButton()}
                {this.renderNextButton()}
            </Col>
        </React.Fragment>
    }


    renderStep() {
        switch (this.state.step) {
            case 1:
                return <StepFirst onSetupMethodCall={this.onSetupMethodCall} type={this.state.type}/>;
            case 2:
                return <StepSecond onSetupMethodCall={this.onSetupMethodCall} events={this.state.listenedEvents}/>;
            case 3:
                return <StepThird onSetupMethodCall={this.onSetupMethodCall} url={this.state.url}/>;
            case 4:
                let toastId = toastAwait("Adding new webhook...");
                axios.post(this.context.apiRoute + "/boards/" + this.props.data.discriminator + "/webhooks", {
                    url: this.state.url,
                    type: this.state.type,
                    events: this.state.listenedEvents,
                }, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 201) {
                        toastWarning("Couldn't add webhook due to unknown error!", toastId);
                        return;
                    }
                    toastSuccess("Added new webhook, sending sample response.", toastId);
                    this.props.history.push("/ba/" + this.props.data.discriminator + "/webhooks");
                }).catch(err => {
                    toastError(err.response.data.errors[0], toastId);
                });
                return <StepThird onSetupMethodCall={this.onSetupMethodCall} url={this.state.url}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                this.setState({step: 1});
                return <StepFirst onSetupMethodCall={this.onSetupMethodCall} chosen={this.state.chosen} customIcon={this.state.customIcon} iconData={this.state.iconData}/>;
        }
    }

    onSetupMethodCall = (type, value) => {
        switch (type) {
            case "url":
                this.setState({url: value});
                return;
            case "type":
                if (value === "CUSTOM_ENDPOINT") {
                    toastWarning("Option not yet available.");
                    return;
                }
                this.setState({type: value});
                return;
            case "event":
                if (this.state.listenedEvents.includes(value)) {
                    this.setState({listenedEvents: this.state.listenedEvents.filter(item => item !== value)});
                } else {
                    this.setState({listenedEvents: [...this.state.listenedEvents, value]});
                }
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
        if (this.state.step >= 3) {
            return <Button variant="success" className="text-white" onClick={this.nextStep}>Finish</Button>
        }
        return <Button variant="" style={{backgroundColor: "#0994f6"}} className="text-white pr-1" onClick={this.nextStep}>Next <FaAngleRight/></Button>
    }

    previousStep = () => {
        this.setState({step: this.state.step - 1});
    };

    nextStep = () => {
        if (this.state.step === 1 && this.state.type === "") {
            toastWarning("Type must be chosen.");
            return;
        } else if (this.state.step === 2 && this.state.listenedEvents.length === 0) {
            toastWarning("Events must be chosen.");
            return;
        } else if (this.state.step === 3 && this.state.url === "") {
            toastWarning("URL must be typed.");
            return;
        }
        this.setState({step: this.state.step + 1});
    };

}

export default withRouter(CreateWebhook);