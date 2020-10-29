import React, {useContext, useState} from 'react';
import {Button, Col, Container, ProgressBar, Row} from "react-bootstrap";
import Steps, {Step} from "rc-steps";
import {Link, useHistory, withRouter} from "react-router-dom";
import StepFirst from "views/admin/subviews/webhooks/steps/step-first";
import StepSecond from "views/admin/subviews/webhooks/steps/step-second";
import {toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import axios from "axios";
import StepThird from "views/admin/subviews/webhooks/steps/step-third";

import "views/Steps.css";
import {NextStepButton, PreviousStepButton} from "components/steps/steps-buttons";
import BoardContext from "context/board-context";

const CreateWebhook = () => {
    const history = useHistory();
    const boardData = useContext(BoardContext).data;
    const [settings, setSettings] = useState({step: 1, type: "", listenedEvents: [], url: ""});
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
                let toastId = toastAwait("Adding new webhook...");
                axios.post("/boards/" + boardData.discriminator + "/webhooks", {
                    url: settings.url, type: settings.type, events: settings.listenedEvents,
                }).then(res => {
                    if (res.status !== 201) {
                        toastWarning("Couldn't add webhook due to unknown error!", toastId);
                        return;
                    }
                    toastSuccess("Added new webhook, sending sample response.", toastId);
                    history.push("/ba/" + boardData.discriminator + "/webhooks");
                }).catch(err => {
                    toastError(err.response.data.errors[0], toastId);
                    setSettings({...settings, step: 3});
                });
                return <StepThird updateSettings={updateSettings} settings={settings}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                setSettings({...settings, step: 1});
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
            return <Button variant="success" className="ml-2" onClick={nextStep}>Finish</Button>
        }
        return <NextStepButton nextStep={nextStep}/>
    };
    const previousStep = () => {
        setSettings({...settings, step: settings.step - 1});
    };
    const nextStep = () => {
        if (settings.step === 1 && settings.type === "") {
            toastWarning("Type must be chosen.");
            return;
        } else if (settings.step === 2 && settings.listenedEvents.length === 0) {
            toastWarning("Events must be chosen.");
            return;
        } else if (settings.step === 3 && settings.url === "") {
            toastWarning("URL must be typed.");
            return;
        }
        setSettings({...settings, step: settings.step + 1});
    };
    return <Container>
        <Row className="mt-5">
            <Col xs={12} className="d-none d-sm-block">
                <Steps direction="horizontal" size="small" progressDot current={settings.step}>
                    <Step title="Select Type"/>
                    <Step title="Choose Events"/>
                    <Step title="Set URL"/>
                    <Step title="Finish" state="finish"/>
                </Steps>
            </Col>
            <Col xs={12} className="d-sm-none px-4">
                <small>Step {settings.step}</small>
                <ProgressBar now={settings.step * 25}/>
            </Col>
            {renderStep()}
            <Col xs={12} className="text-right mt-4">
                <Button variant="link" className="text-black-60 btn-cancel" as={Link} to={"/ba/" + boardData.discriminator + "/webhooks"}>Cancel</Button>
                {renderBackButton()}
                {renderNextButton()}
            </Col>
        </Row>
    </Container>
};

export default withRouter(CreateWebhook);