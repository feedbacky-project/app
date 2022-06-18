import PropTypes from 'prop-types';
import React from 'react';
import {FaAngleLeft, FaAngleRight} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiButton} from "ui/button/UiButton";

const UiNextStepButton = (props) => {
    const {nextStep, ...otherProps} = props;

    return <UiButton color={tinycolor("#0994f6")} className={"pr-1 ml-2"} onClick={nextStep} label={"Go Next"} {...otherProps}>Next <FaAngleRight/></UiButton>
};

const UiPreviousStepButton = (props) => {
    const {previousStep, ...otherProps} = props;

    return <UiButton color={tinycolor("#0994f6")} className={"pl-1 ml-2"} onClick={previousStep} label={"Go Back"} {...otherProps}><FaAngleLeft/> Back</UiButton>
};

export {UiNextStepButton};
export {UiPreviousStepButton};

UiNextStepButton.propTypes = {
    nextStep: PropTypes.func.isRequired
};

UiPreviousStepButton.propTypes = {
    previousStep: PropTypes.func.isRequired
};