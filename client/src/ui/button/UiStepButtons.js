import PropTypes from 'prop-types';
import React from 'react';
import {FaAngleLeft, FaAngleRight} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiButton} from "ui/button/UiButton";

const UiNextStepButton = ({nextStep}) => {
    return <UiButton color={tinycolor("#0994f6")} className={"pr-1 ml-2"} onClick={nextStep}>Next <FaAngleRight/></UiButton>
};

const UiPreviousStepButton = ({previousStep}) => {
    return <UiButton color={tinycolor("#0994f6")} className={"pl-1"} onClick={previousStep}><FaAngleLeft/> Back</UiButton>
};

export {UiNextStepButton};
export {UiPreviousStepButton};

UiNextStepButton.propTypes = {
    nextStep: PropTypes.func.isRequired
};

UiPreviousStepButton.propTypes = {
    previousStep: PropTypes.func.isRequired
};