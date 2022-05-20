import UndrawChooseEvents from "assets/svg/undraw/choose_events.svg";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import {AppContext} from "context";
import React, {useContext, useState} from 'react';
import tinycolor from "tinycolor2";
import {UiBadge, UiKeyboardInput, UiLabelledCheckbox} from "ui";
import {UiButton} from "ui/button";
import {UiCol, UiRow} from "ui/grid";
import {prettifyTrigger} from "utils/basic-utils";

const StepSecondSubroute = ({updateSettings, settings}) => {
    const {serviceData} = useContext(AppContext);
    const [showAll, setShowAll] = useState(false);
    const onChoose = (item) => {
        if (settings.triggers.includes(item)) {
            updateSettings({...settings, triggers: settings.triggers.filter(event => event !== item)});
        } else {
            updateSettings({...settings, triggers: [...settings.triggers, item]});
        }
    };
    const renderCommonTriggers = () => {
        //board triggers unsupported for webhooks
        let triggers = Object.keys(serviceData.actionTriggers).filter(c => c !== "board");
        if (!showAll) {
            triggers = triggers.filter(c => c === "idea" || c === "comment");
        }
        return triggers.map((category, j) => {
            return <UiCol as={UiRow} xs={12} key={category + j} className={"mb-2 px-0"}>
                <UiCol xs={12} className={"font-weight-bold"}>Triggers for <UiKeyboardInput>{category}</UiKeyboardInput></UiCol>
                {serviceData.actionTriggers[category].map((trigger, i) => {
                    return <UiCol key={trigger + i} xs={6} md={4} className={"pr-0"}>
                        <UiLabelledCheckbox id={trigger + i} checked={settings.triggers.includes(trigger)} onChange={() => onChoose(trigger)}>
                            <UiBadge style={{letterSpacing: "-.1pt", wordSpacing: "-.2pt"}} color={tinycolor("#ffa500")}>{prettifyTrigger(category, trigger)}</UiBadge>
                        </UiLabelledCheckbox>
                    </UiCol>
                })}
            </UiCol>
        })
    };
    const renderButton = () => {
        if (showAll) {
            return <UiButton label={"Hide Advanced Triggers"} className={"mt-2"} small onClick={() => setShowAll(false)}>Hide Advanced Triggers</UiButton>
        }
        return <UiButton label={"Show Advanced Triggers"} className={"mt-2"} small onClick={() => setShowAll(true)}>Show Advanced Triggers</UiButton>
    }

    return <React.Fragment>
        <SetupImageBanner svg={UndrawChooseEvents} stepName={"Choose Triggers"} stepDescription={"Select triggers that this webhook will listen to. Some triggers may be duplicated."}/>
        <UiCol centered as={UiRow} xs={12} className={"mt-4 px-0"}>
            {renderCommonTriggers()}
            {renderButton()}
        </UiCol>
    </React.Fragment>
};

export default StepSecondSubroute;