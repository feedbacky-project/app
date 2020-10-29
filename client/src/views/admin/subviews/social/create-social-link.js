import React, {useContext, useState} from 'react';
import StepFirst from "views/admin/subviews/social/steps/step-first";
import StepSecond from "views/admin/subviews/social//steps/step-second";
import {Button, Col, Container, ProgressBar, Row} from "react-bootstrap";
import {toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import axios from "axios";
import Steps, {Step} from "rc-steps";
import {Link, useHistory, withRouter} from "react-router-dom";

import "views/Steps.css";
import {NextStepButton, PreviousStepButton} from "components/steps/steps-buttons";
import BoardContext from "context/board-context";

const CreateSocialLink = () => {
    const boardData = useContext(BoardContext).data;
    const history = useHistory();
    const [settings, setSettings] = useState({step: 1, iconData: "", url: "", chosen: -1, customIcon: false});
    const renderStep = () => {
        switch (settings.step) {
            case 1:
                return <StepFirst updateSettings={updateSettings} settings={settings}/>;
            case 2:
                return <StepSecond updateSettings={updateSettings} settings={settings}/>;
            case 3:
                let toastId = toastAwait("Adding new social link...");
                axios.post("/boards/" + boardData.discriminator + "/socialLinks", {
                    iconData: settings.iconData, url: settings.url
                }).then(res => {
                    if (res.status !== 201) {
                        toastWarning("Couldn't add social link due to unknown error!", toastId);
                        return;
                    }
                    toastSuccess("Added new social link.", toastId);
                    history.push({
                        pathname: "/ba/" + boardData.discriminator + "/social",
                        state: null
                    });
                }).catch(err => {
                    toastError(err.response.data.errors[0], toastId);
                    setSettings({...settings, step: 2});
                });
                return <StepSecond updateSettings={updateSettings} settings={settings}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                setSettings({...settings, step: 1});
                return <StepFirst updateSettings={updateSettings} settings={settings}/>;
        }
    };
    const updateSettings = (data) => {
        setSettings(data);
    };
    const renderBackButton = () => {
        if (settings.step === 1) {
            return <React.Fragment/>
        }
        return <PreviousStepButton previousStep={previousStep}/>
    };
    const renderNextButton = () => {
        if (settings.step >= 2) {
            return <Button variant="success" className="ml-2" onClick={nextStep}>Finish</Button>
        }
        return <NextStepButton nextStep={nextStep}/>
    };
    const previousStep = () => {
        setSettings({...settings, step: settings.step - 1});
    };
    const nextStep = () => {
        if (settings.step === 1) {
            if (settings.iconData === "") {
                toastWarning("Icon must be chosen.");
                return;
            }
        }
        setSettings({...settings, step: settings.step + 1});
    };
    return <Container>
        <Row className="mt-5">
            <Col xs={12} className="d-none d-sm-block">
                <Steps direction="horizontal" size="small" progressDot current={settings.step}>
                    <Step title="Choose Icon"/>
                    <Step title="Set Link"/>
                    <Step title="Finish" state="finish"/>
                </Steps>
            </Col>
            <Col xs={12} className="d-sm-none px-4">
                <small>Step {settings.step}</small>
                <ProgressBar now={settings.step * 33.3}/>
            </Col>
            {renderStep()}
            <Col xs={12} className="text-right mt-4">
                <Button variant="link" className="text-black-60 btn-cancel" as={Link} to={"/ba/" + boardData.discriminator + "/social"}>Cancel</Button>
                {renderBackButton()}
                {renderNextButton()}
            </Col>
        </Row>
    </Container>
};

export default withRouter(CreateSocialLink);