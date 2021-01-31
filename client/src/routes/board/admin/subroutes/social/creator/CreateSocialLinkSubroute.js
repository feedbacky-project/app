import axios from "axios";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import {Step} from "rc-steps";
import React, {useContext, useEffect, useState} from 'react';
import {Link, useHistory, withRouter} from "react-router-dom";
import StepFirstRoute from "routes/board/admin/subroutes/social/creator/StepFirstRoute";
import StepSecondRoute from "routes/board/admin/subroutes/social/creator/StepSecondRoute";
import tinycolor from "tinycolor2";
import {UiProgressBar} from "ui";
import {UiButton, UiCancelButton, UiNextStepButton, UiPreviousStepButton} from "ui/button";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {toastAwait, toastError, toastSuccess, toastWarning} from "utils/basic-utils";

const CreateSocialLinkSubroute = () => {
    const {updateState, data: boardData} = useContext(BoardContext);
    const history = useHistory();
    const [settings, setSettings] = useState({step: 1, iconData: "", url: "", chosen: -1, customIcon: false});
    const {setCurrentNode} = useContext(PageNodesContext);
    useEffect(() => setCurrentNode("social"), [setCurrentNode]);

    const updateSettings = data => setSettings(data);
    const renderStep = () => {
        switch (settings.step) {
            case 1:
                return <StepFirstRoute updateSettings={updateSettings} settings={settings}/>;
            case 2:
                return <StepSecondRoute updateSettings={updateSettings} settings={settings}/>;
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
                    const socialLinks = boardData.socialLinks.concat(res.data);
                    updateState({...boardData, socialLinks});
                }).catch(err => {
                    toastError(err.response.data.errors[0], toastId);
                    setSettings({...settings, step: 2});
                });
                return <StepSecondRoute updateSettings={updateSettings} settings={settings}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
                setSettings({...settings, step: 1});
                return <StepFirstRoute updateSettings={updateSettings} settings={settings}/>;
        }
    };
    const renderBackButton = () => {
        if (settings.step === 1) {
            return <React.Fragment/>
        }
        return <UiPreviousStepButton previousStep={previousStep}/>
    };
    const renderNextButton = () => {
        if (settings.step >= 2) {
            return <UiButton color={tinycolor("#00c851")} className={"ml-2"} onClick={nextStep}>Finish</UiButton>
        }
        return <UiNextStepButton nextStep={nextStep}/>
    };
    const previousStep = () => {
        setSettings({...settings, step: settings.step - 1});
    };
    const nextStep = () => {
        if (settings.step === 1 && settings.iconData === "") {
            toastWarning("Icon must be chosen.");
            return;
        } else if (settings.step === 2 && settings.url === "") {
            toastWarning("URL must be typed.");
            return;
        }
        setSettings({...settings, step: settings.step + 1});
    };
    return <UiCol xs={12} md={9}>
        <UiContainer>
            <UiRow className={"mt-5"}>
                <UiProgressBar currentStep={settings.step} steps={3}>
                    <Step title={"Choose Icon"}/>
                    <Step title={"Set Link"}/>
                    <Step title={"Finish"} state={"finish"}/>
                </UiProgressBar>
                {renderStep()}
                <UiCol xs={12} className={"text-right mt-4"}>
                    <UiCancelButton as={Link} to={"/ba/" + boardData.discriminator + "/social"}>Cancel</UiCancelButton>
                    {renderBackButton()}
                    {renderNextButton()}
                </UiCol>
            </UiRow>
        </UiContainer>
    </UiCol>
};

export default withRouter(CreateSocialLinkSubroute);