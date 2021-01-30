import UndrawCreateProject from "assets/svg/undraw/create_project.svg";
import SetupCard from "components/board/admin/SetupCard";
import React from 'react';
import {CardDeck} from "react-bootstrap";
import {FaDiscord, FaGlobe} from "react-icons/fa";
import {UiCol, UiRow} from "ui/grid";
import {toastWarning} from "utils/basic-utils";

const type = ["DISCORD", "CUSTOM_ENDPOINT"];
const typeName = ["Discord", "Custom Endpoint"];
const typeIcon = [<FaDiscord className={"fa-md"}/>, <FaGlobe className={"fa-md"}/>];

const StepFirstSubroute = ({updateSettings, settings}) => {
    const onChoose = (item) => {
        if (item === "CUSTOM_ENDPOINT") {
            toastWarning("Option not yet available.");
            return;
        }
        updateSettings({...settings, type: item});
    };
    const renderCards = () => {
        return type.map((item, i) => {
            let name = typeName[i];
            return <SetupCard key={i} icon={typeIcon[i]} text={name} onClick={() => onChoose(item)} className={"mb-3"} chosen={settings.type === item}/>
        });
    };

    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawCreateProject} className={"my-2"} width={150} height={150}/>
            <h2>Select Webhook Type</h2>
            <span className={"text-black-60"}>
                Select in which way you'll utilize this webhook.
            </span>
        </UiCol>
        <UiCol xs={12} className={"mt-4 px-md-5 px-3"}>
            <UiRow centered>
                <CardDeck>
                    {renderCards()}
                </CardDeck>
            </UiRow>
        </UiCol>
    </React.Fragment>;
};

export default StepFirstSubroute;