import axios from "axios";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import {Step} from "rc-steps";
import React, {useContext, useEffect, useState} from 'react';
import {Link, useHistory, withRouter} from "react-router-dom";
import StepFirstSubroute from "routes/board/admin/subroutes/webhooks/creator/StepFirstSubroute";
import StepSecondSubroute from "routes/board/admin/subroutes/webhooks/creator/StepSecondSubroute";
import StepThirdSubroute from "routes/board/admin/subroutes/webhooks/creator/StepThirdSubroute";
import tinycolor from "tinycolor2";
import {UiProgressBar} from "ui";
import {UiButton, UiCancelButton, UiNextStepButton, UiPreviousStepButton} from "ui/button";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {toastAwait, toastSuccess, toastWarning} from "utils/basic-utils";

const CreateWebhookSubroute = () => {
    const history = useHistory();
    const {data: boardData} = useContext(BoardContext);
    const [settings, setSettings] = useState({step: 1, type: "", listenedEvents: [], url: ""});
    const {setCurrentNode} = useContext(PageNodesContext);
    useEffect(() => setCurrentNode("webhooks"), [setCurrentNode]);

    const updateSettings = data => setSettings(data);
    const renderStep = () => {
        switch (settings.step) {
            case 1:
                return <StepFirstSubroute updateSettings={updateSettings} settings={settings}/>;
            case 2:
                return <StepSecondSubroute updateSettings={updateSettings} settings={settings}/>;
            case 3:
                return <StepThirdSubroute updateSettings={updateSettings} settings={settings}/>;
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
                }).catch(() => setSettings({...settings, step: 3}));
                return <StepThirdSubroute updateSettings={updateSettings} settings={settings}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                setSettings({...settings, step: 1});
                return <StepFirstSubroute updateSettings={updateSettings} settings={settings}/>;
        }
    };
    const renderBackButton = () => {
        if (settings.step === 1) {
            return <React.Fragment/>
        }
        return <UiPreviousStepButton previousStep={previousStep}/>
    };
    const renderNextButton = () => {
        if (settings.step >= 3) {
            return <UiButton label={"Finish"} color={tinycolor("#00c851")} className={"ml-2"} onClick={nextStep}>Finish</UiButton>
        }
        return <UiNextStepButton nextStep={nextStep}/>
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
    return <UiCol xs={12} md={9}>
        <UiContainer>
            <UiRow className={"mt-5"}>
                <UiProgressBar currentStep={settings.step} steps={4}>
                    <Step title={"Select Type"}/>
                    <Step title={"Choose Events"}/>
                    <Step title={"Set URL"}/>
                    <Step title={"Finish"} state={"finish"}/>
                </UiProgressBar>
                {renderStep()}
                <UiCol xs={12} className={"text-right mt-4"}>
                    <UiCancelButton as={Link} to={"/ba/" + boardData.discriminator + "/webhooks"}>Cancel</UiCancelButton>
                    {renderBackButton()}
                    {renderNextButton()}
                </UiCol>
            </UiRow>
        </UiContainer>
    </UiCol>
};

export default withRouter(CreateWebhookSubroute);