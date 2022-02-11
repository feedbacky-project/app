import React from "react";
import {UiCol} from "ui/grid";

const SetupImageBanner = ({svg, stepName, stepDescription}) => {
    return <UiCol xs={12} className={"mt-4 text-center"}>
        <img alt={"Banner"} src={svg} className={"my-2"} width={150} height={150}/>
        <h2>{stepName}</h2>
        <span className={"text-black-60"}>{stepDescription}</span>
    </UiCol>
};

export default SetupImageBanner;