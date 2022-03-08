import styled from "@emotion/styled";
import "assets/scss/commons/setup-steps.scss";
import PropTypes from "prop-types";
import Steps from "rc-steps";
import React, {useContext} from "react";
import {UiCol} from "ui/grid";
import {UiThemeContext} from "ui/index";

const ProgressSteps = styled(Steps)`
  .rc-steps-item-title {
    color: var(--font-color) !important;
  }

  .rc-steps-item-tail:after {
    background-color: var(--secondary);
  }

  .rc-steps-item-finish .rc-steps-item-icon > .rc-steps-icon .rc-steps-icon-dot {
    background-color: ${props => props.theme.toHexString()};
  }

  .rc-steps-item-process .rc-steps-item-icon > .rc-steps-icon .rc-steps-icon-dot {
    background-color: ${props => props.theme.toHexString()};
  }

  .rc-steps-item-finish .rc-steps-item-tail:after {
    background-color: ${props => props.theme.toHexString()};
  }
`;

const PageProgress = styled.div`
  display: flex;
  height: 1rem;
  overflow: hidden;
  border-radius: var(--border-radius);
  font-size: var(--font-size);

  .dark & {
    background-color: var(--font-color) !important;
  }
`;

const PageProgressBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  transition: width 0.6s ease;
  background-size: 1rem;
  background-color: ${props => props.theme.toHexString()};
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  width: ${props => props.now}%;
`;

const UiProgressBar = (props) => {
    const {currentStep, steps, children} = props;
    const {getTheme} = useContext(UiThemeContext);

    return <React.Fragment>
        <UiCol xs={12} className={"d-none d-sm-block"}>
            <ProgressSteps theme={getTheme()} direction={"horizontal"} size={"small"} progressDot current={currentStep}>
                {children}
            </ProgressSteps>
        </UiCol>
        <UiCol xs={12} className={"d-sm-none px-4"}>
            <small>Step {currentStep}</small>
            <PageProgress>
                <PageProgressBar theme={getTheme()} now={(currentStep / steps) * 100}/>
            </PageProgress>
        </UiCol>
    </React.Fragment>
};

UiProgressBar.propTypes = {
    currentStep: PropTypes.number,
    steps: PropTypes.number
};

export {UiProgressBar};