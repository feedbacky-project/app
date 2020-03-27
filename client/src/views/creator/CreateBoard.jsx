import React, {Component} from 'react';

import "../Steps.css";

import AppContext from "../../context/AppContext";
import {getSimpleRequestConfig, toastAwait, toastError, toastSuccess, toastWarning} from "../../components/util/Utils";
import {Button, Col, Container, ProgressBar, Row} from "react-bootstrap";
import Steps, {Step} from "rc-steps";
import ProfileNavbar from "../../components/navbars/ProfileNavbar";
import {MdNavigateBefore, MdNavigateNext} from "react-icons/md";
import {Link} from "react-router-dom";
import StepFirst from "./steps/StepFirst";
import StepSecond from "./steps/StepSecond";
import StepThird from "./steps/StepThird";
import axios from "axios";

class CreateBoard extends Component {

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
        if(!this.context.serviceData.boardsCreatingAllowed) {
            this.props.history.push("/me");
            toastWarning("Boards creator was disabled by administrator.");
            return <React.Fragment/>
        }
        if (!this.context.user.loggedIn) {
            this.props.history.push("/me");
            toastWarning("Please log in to create a board.");
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
        if (this.calculateOwnedBoards() >= 5) {
            return <Col xs={12} className="mt-4 text-center">
                <img alt="" src="https://cdn.feedbacky.net/static/svg/undraw_project_limit.svg" className="my-2" width={150} height={150}/>
                <h2 className="text-danger">Boards Limit Reached</h2>
                <span className="text-black-60">
                    Cannot create any more boards.
                </span>
            </Col>
        }
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
                axios.post(this.context.apiRoute + "/boards/", {
                    discriminator: this.state.discriminator,
                    name: this.state.name,
                    shortDescription: this.state.name + " feedback",
                    fullDescription: "Feedback for **" + this.state.name + "** project." +
                        " " +
                        "Edit this description in admin panel.",
                    themeColor: this.state.themeColor,
                    banner: this.state.banner,
                    logo: this.state.logo,
                }, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 201) {
                        toastWarning("Couldn't create new board due to unknown error!", toastId);
                        return;
                    }
                    toastSuccess("Created new board! Hooray!", toastId);
                    this.props.history.push("/b/" + this.state.discriminator);
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                });
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
        }
    };

    renderBackButton() {
        if (this.state.step === 1) {
            return <React.Fragment/>
        }
        return <Button variant="" style={{backgroundColor: "#0994f6"}} className="text-white pl-1" onClick={this.previousStep}><MdNavigateBefore/> Back</Button>
    }

    renderNextButton() {
        if (this.state.step === 3) {
            return <Button variant="success" className="text-white" onClick={this.nextStep}>Create Board</Button>
        }
        return <Button variant="" style={{backgroundColor: "#0994f6"}} className="text-white pr-1" onClick={this.nextStep}>Next <MdNavigateNext/></Button>
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
        }
        this.setState({step: this.state.step + 1});
    };

    async checkBoardAvailability() {
        return axios.get(this.context.apiRoute + "/boards/" + this.state.discriminator).then(res => {
            return res.status === 200;
        }).catch(() => {
            return false;
        });
    };

    calculateOwnedBoards = () => {
        let owned = 0;
        this.context.user.moderates.forEach(board => {
            if (board.role.toLowerCase() === "owner") {
                owned++;
            }
        });
        return owned;
    };
}

export default CreateBoard;