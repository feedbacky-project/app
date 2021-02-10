import axios from "axios";
import ProfileNavbar from "components/profile/ProfileNavbar";
import AppContext from "context/AppContext";
import {Step} from "rc-steps";
import React, {useContext, useEffect, useState} from 'react';
import {Link, useHistory} from "react-router-dom";
import StepFirstSubroute from "routes/board/creator/StepFirstSubroute";
import StepSecondSubroute from "routes/board/creator/StepSecondSubroute";
import StepThirdSubroute from "routes/board/creator/StepThirdSubroute";
import tinycolor from "tinycolor2";
import {UiProgressBar} from "ui";
import {UiButton, UiCancelButton, UiNextStepButton, UiPreviousStepButton} from "ui/button";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {isServiceAdmin, toastAwait, toastError, toastSuccess, toastWarning} from "utils/basic-utils";

const CreatorBoardRoute = () => {
    const context = useContext(AppContext);
    const {onThemeChange, user} = context;
    const history = useHistory();
    const [settings, setSettings] = useState({step: 1, name: "", discriminator: "", banner: null, logo: null, themeColor: "#2d3436"});
    useEffect(() => onThemeChange(), [onThemeChange]);
    if (!user.loggedIn || !isServiceAdmin(context)) {
        history.push("/me");
        return <React.Fragment/>
    }
    const updateSettings = (data) => {
        setSettings(data);
    };
    const renderStep = () => {
        switch (settings.step) {
            case 1:
                return <StepFirstSubroute updateSettings={updateSettings} settings={settings}/>;
            case 2:
                return <StepSecondSubroute updateSettings={updateSettings} settings={settings}/>;
            case 3:
                return <StepThirdSubroute updateSettings={updateSettings} settings={settings}/>;
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
                });
                return <StepThirdSubroute updateSettings={updateSettings} settings={settings}/>;
            default:
                toastWarning("Setup encountered unexpected issue.");
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
            return <UiButton label={"Create Board"} color={tinycolor("#00c851")} className={"ml-2"} onClick={nextStep}>Create Board</UiButton>
        }
        return <UiNextStepButton nextStep={nextStep}/>
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
        <UiContainer>
            <UiRow className={"mt-5"}>
                <UiProgressBar currentStep={settings.step} steps={4}>
                    <Step title={"Choose Name"}/>
                    <Step title={"Brand Board"}/>
                    <Step title={"Select Theme"}/>
                    <Step title={"Finish"} state={"finish"}/>
                </UiProgressBar>
                {renderStep()}
                <UiCol xs={12} className={"text-right mt-4"}>
                    <UiCancelButton as={Link} to={"/me"}>Cancel</UiCancelButton>
                    {renderBackButton()}
                    {renderNextButton()}
                </UiCol>
            </UiRow>
        </UiContainer>
    </React.Fragment>
};

export default CreatorBoardRoute;