import React, {Component} from 'react';

import "views/Steps.css";

import AppContext from "context/app-context";
import {isServiceAdmin, toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import {Button, Col, Container, ProgressBar, Row} from "react-bootstrap";
import Steps, {Step} from "rc-steps";
import ProfileNavbar from "components/navbars/profile-navbar";
import {Link} from "react-router-dom";
import StepFirst from "views/creator/steps/step-first";
import StepSecond from "views/creator/steps/step-second";
import StepThird from "views/creator/steps/step-third";
import axios from "axios";
import {NextStepButton, PreviousStepButton} from "components/steps/steps-buttons";

class CreateBoardView extends Component {

    static contextType = AppContext;

    state = {
        step: 1,
        name: "",
        discriminator: "",
        banner: null,
        logo: null,
        themeColor: "#2d3436"
    };

    constructor(props) {
        super(props);
        this.checkBoardAvailability = this.checkBoardAvailability.bind(this);
    }

    render() {
        if (!this.context.user.loggedIn || !isServiceAdmin(this.context)) {
            this.props.history.push("/me");
            return <React.Fragment/>
        }
        return <React.Fragment>
            <ProfileNavbar/>
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
                    <Step title="Choose Name"/>
                    <Step title="Brand Board"/>
                    <Step title="Select Theme"/>
                    <Step title="Finish" state="finish"/>
                </Steps>
            </Col>
            <Col xs={12} className="d-sm-none px-4">
                <small>Step {this.state.step}</small>
                <ProgressBar now={this.state.step * 25}/>
            </Col>
            {this.renderStep()}
            <Col xs={12} className="text-right mt-4">
                <Button variant="link" className="text-black-60" as={Link} to="/me">Cancel</Button>
                {this.renderBackButton()}
                {this.renderNextButton()}
            </Col>
        </React.Fragment>
    }

    renderStep() {
        switch (this.state.step) {
            case 1:
                return <StepFirst onSetupMethodCall={this.onSetupMethodCall} name={this.state.name} discriminator={this.state.discriminator}/>;
            case 2:
                return <StepSecond onSetupMethodCall={this.onSetupMethodCall} banner={this.state.banner} logo={this.state.logo}/>;
            case 3:
                return <StepThird onSetupMethodCall={this.onSetupMethodCall} theme={this.state.themeColor}/>;
            case 4:
                let toastId = toastAwait("Creating new board...");
                axios.post("/boards/", {
                    discriminator: this.state.discriminator,
                    name: this.state.name,
                    shortDescription: this.state.name + " feedback",
                    fullDescription: "Feedback for **" + this.state.name + "** project." +
                        " " +
                        "Edit this description in admin panel.",
                    themeColor: this.state.themeColor,
                    banner: this.state.banner,
                    logo: this.state.logo,
                }).then(res => {
                    if (res.status !== 201) {
                        toastWarning("Couldn't create new board due to unknown error!", toastId);
                        return;
                    }
                    toastSuccess("Created new board! Hooray!", toastId);
                    this.props.history.push("/b/" + this.state.discriminator);
                }).catch(err => toastError(err.response.data.errors[0]));
                return <StepThird onSetupMethodCall={this.onSetupMethodCall} theme={this.state.themeColor}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                return <StepFirst onSetupMethodCall={this.onSetupMethodCall} name={this.state.name} discriminator={this.state.discriminator}/>;
        }
    }

    onSetupMethodCall = (type, value) => {
        switch (type) {
            case "name":
                this.setState({name: value});
                return;
            case "discriminator":
                this.setState({discriminator: value});
                return;
            case "banner":
                this.setState({banner: value});
                return;
            case "logo":
                this.setState({logo: value});
                return;
            case "themeColor":
                this.setState({themeColor: value});
                return;
            default:
                return;
        }
    };

    renderBackButton() {
        if (this.state.step === 1) {
            return <React.Fragment/>
        }
        return <PreviousStepButton previousStep={this.previousStep}/>
    }

    renderNextButton() {
        if (this.state.step === 3) {
            return <Button variant="success" className="ml-2" onClick={this.nextStep}>Create Board</Button>
        }
        return <NextStepButton nextStep={this.nextStep}/>
    }

    previousStep = () => {
        this.setState({step: this.state.step - 1});
    };

    nextStep = () => {
        if (this.state.step === 1) {
            if (this.state.name === "" || this.state.discriminator === "") {
                toastWarning("Values must not be empty.");
                return;
            }
            if (this.state.name.length < 4) {
                toastWarning("Board name must be longer.");
                return;
            }
            if (this.state.discriminator.length < 3) {
                toastWarning("Discriminator must be longer.");
                return;
            }
            this.checkBoardAvailability().then(res => {
                if (res) {
                    toastWarning("Board with that discriminator already exists.");
                    return;
                }
                this.setState({step: this.state.step + 1});
            });
            return;
        } else if (this.state.step === 2) {
            if (this.state.banner === null || this.state.logo === null) {
                toastWarning("Banner and logo must be set.");
                return;
            }
        }
        this.setState({step: this.state.step + 1});
    };

    async checkBoardAvailability() {
        return axios.get("/boards/" + this.state.discriminator).then(res => res.status === 200).catch(() => false);
    }
}

export default CreateBoardView;