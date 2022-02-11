import UndrawCreateProject from "assets/svg/undraw/create_project.svg";
import SetupCard, {SetupCardIcon} from "components/board/admin/SetupCard";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import React from 'react';
import {FaDiscord, FaGlobe} from "react-icons/fa";
import {UiCol, UiRow} from "ui/grid";
import {popupWarning} from "utils/basic-utils";

const type = ["DISCORD", "CUSTOM_ENDPOINT"];
const typeName = ["Discord", "Custom Endpoint"];
const typeIcon = [<SetupCardIcon as={FaDiscord}/>, <SetupCardIcon as={FaGlobe}/>];

const StepFirstSubroute = ({updateSettings, settings}) => {
    const onChoose = (item) => {
        if (item === "CUSTOM_ENDPOINT") {
            popupWarning("Option not yet available");
            return;
        }
        updateSettings({...settings, type: item});
    };
    const renderCards = () => {
        return type.map((item, i) => {
            let name = typeName[i];
            return <SetupCard key={i} icon={typeIcon[i]} text={name} onClick={() => onChoose(item)} className={"m-2"} chosen={settings.type === item}/>
        });
    };

    return <React.Fragment>
        <SetupImageBanner svg={UndrawCreateProject} stepName={"Select Webhook Type"} stepDescription={"Select in which way you'll utilize this webhook."}/>
        <UiCol xs={12} className={"mt-4"}>
            <UiCol as={UiRow} centered className={"mx-0"} xs={12}>
                {renderCards()}
            </UiCol>
        </UiCol>
    </React.Fragment>;
};

export default StepFirstSubroute;