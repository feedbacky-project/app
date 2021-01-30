import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import Steps from "rc-steps";
import React, {useContext} from "react";
import {ProgressBar} from "react-bootstrap";
import "assets/scss/commons/setup-steps.scss";
import {UiCol} from "ui/grid";

const ProgressSteps = styled(Steps)`
  .rc-steps-item-finish .rc-steps-item-icon > .rc-steps-icon .rc-steps-icon-dot {
    background-color: ${props => props.theme};
  }
  .rc-steps-item-process .rc-steps-item-icon > .rc-steps-icon .rc-steps-icon-dot {
    background-color: ${props => props.theme};
  }
  .rc-steps-item-finish .rc-steps-item-tail:after {
    background-color: ${props => props.theme};
  }
`;

const PageProgressBar = styled(ProgressBar)`
  .progress-bar {
    background-color: ${props => props.theme};
  }
`;

const UiProgressBar = ({currentStep, steps, children}) => {
    const {getTheme} = useContext(AppContext);
    return <React.Fragment>
        <UiCol xs={12} className={"d-none d-sm-block"}>
            <ProgressSteps theme={getTheme().toHexString()} direction={"horizontal"} size={"small"} progressDot current={currentStep}>
                {children}
            </ProgressSteps>
        </UiCol>
        <UiCol xs={12} className={"d-sm-none px-4"}>
            <small>Step {currentStep}</small>
            <PageProgressBar theme={getTheme().toHexString()} now={(currentStep / steps) * 100}/>
        </UiCol>
    </React.Fragment>
};

export {UiProgressBar};