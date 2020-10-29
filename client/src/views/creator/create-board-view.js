import React, {useContext, useEffect, useState} from 'react';
import AppContext from "context/app-context";
import {isServiceAdmin, toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import {Button, Col, Container, ProgressBar, Row} from "react-bootstrap";
import Steps, {Step} from "rc-steps";
import ProfileNavbar from "components/navbars/profile-navbar";
import {Link, useHistory} from "react-router-dom";
import StepFirst from "views/creator/steps/step-first";
import StepSecond from "views/creator/steps/step-second";
import StepThird from "views/creator/steps/step-third";
import axios from "axios";
import {NextStepButton, PreviousStepButton} from "components/steps/steps-buttons";
import "views/Steps.css";

const CreateBoardView = () => {
    const context = useContext(AppContext);
    const history = useHistory();
    const [settings, setSettings] = useState({step: 1, name: "", discriminator: "", banner: null, logo: null, themeColor: "#2d3436"});
    useEffect(() => context.onThemeChange("343a40"),
        //eslint-disable-next-line
        []);
    if (!context.user.loggedIn || !isServiceAdmin(context)) {
        history.push("/me");
        return <React.Fragment/>
    }
    const updateSettings = (data) => {
        setSettings(data);
    };
    const renderStep = () => {
        switch (settings.step) {
            case 1:
                return <StepFirst updateSettings={updateSettings} settings={settings}/>;
            case 2:
                return <StepSecond updateSettings={updateSettings} settings={settings}/>;
            case 3:
                return <StepThird updateSettings={updateSettings} settings={settings}/>;
            case 4:
                let toastId = toastAwait("Creating new board...");
                axios.post("/boards/", {
                    discriminator: settings.discriminator,
                    name: settings.name,
                    shortDescription: settings.name + " feedback",
                    fullDescription: "Feedback for **" + settings.name + "** project." +
                        " " +
                        "Edit this description in admin panel.",
                    themeColor: settings.themeColor,
                    banner: settings.banner,
                    logo: settings.logo,
                }).then(res => {
                    if (res.status !== 201) {
                        toastWarning("Couldn't create new board due to unknown error!", toastId);
                        return;
                    }
                    toastSuccess("Created new board! Hooray!", toastId);
                    history.push("/b/" + settings.discriminator);
                }).catch(err => toastError(err.response.data.errors[0]));
                return <StepThird updateSettings={updateSettings} settings={settings}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                return <StepFirst updateSettings={updateSettings} settings={settings}/>;
        }
    };
    const renderBackButton = () => {
        if (settings.step === 1) {
            return <React.Fragment/>
        }
        return <PreviousStepButton previousStep={previousStep}/>
    };
    const renderNextButton = () => {
        if (settings.step >= 3) {
            return <Button variant="success" className="ml-2" onClick={nextStep}>Create Board</Button>
        }
        return <NextStepButton nextStep={nextStep}/>
    };
    const previousStep = () => {
        setSettings({...settings, step: settings.step - 1});
    };
    const nextStep = () => {
        if (settings.step === 1) {
            if (settings.name === "" || settings.discriminator === "") {
                toastWarning("Values must not be empty.");
                return;
            }
            if (settings.name.length < 4) {
                toastWarning("Board name must be longer.");
                return;
            }
            if (settings.discriminator.length < 3) {
                toastWarning("Discriminator must be longer.");
                return;
            }
            axios.get("/boards/" + settings.discriminator).then(res => {
                if (res.status === 200) {
                    toastWarning("Board with that discriminator already exists.");
                }
            }).catch(() => setSettings({...settings, step: settings.step + 1}));
            return;
        } else if (settings.step === 2) {
            if (settings.banner === null || settings.logo === null) {
                toastWarning("Banner and logo must be set.");
                return;
            }
        }
        setSettings({...settings, step: settings.step + 1});
    };
    return <React.Fragment>
        <ProfileNavbar/>
        <Container>
            <Row className="mt-5">
                <Col xs={12} className="d-none d-sm-block">
                    <Steps direction="horizontal" size="small" progressDot current={settings.step}>
                        <Step title="Choose Name"/>
                        <Step title="Brand Board"/>
                        <Step title="Select Theme"/>
                        <Step title="Finish" state="finish"/>
                    </Steps>
                </Col>
                <Col xs={12} className="d-sm-none px-4">
                    <small>Step {settings.step}</small>
                    <ProgressBar now={settings.step * 25}/>
                </Col>
                {renderStep()}
                <Col xs={12} className="text-right mt-4">
                    <Button variant="link" className="text-black-60 btn-cancel" as={Link} to="/me">Cancel</Button>
                    {renderBackButton()}
                    {renderNextButton()}
                </Col>
            </Row>
        </Container>
    </React.Fragment>
};

export default CreateBoardView;