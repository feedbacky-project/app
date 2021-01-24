import React from 'react';
import {FaAngleLeft, FaAngleRight} from "react-icons/all";
import PropTypes from 'prop-types';
import PageButton from "../app/page-button";
import tinycolor from "tinycolor2";

export const NextStepButton = ({nextStep}) => {
    return <PageButton color={tinycolor("#0994f6")} className="pr-1 ml-2" onClick={nextStep}>Next <FaAngleRight/></PageButton>
};

export const PreviousStepButton = ({previousStep}) => {
    return <PageButton color={tinycolor("#0994f6")} className="pl-1" onClick={previousStep}><FaAngleLeft/> Back</PageButton>
};

NextStepButton.propTypes = {
    nextStep: PropTypes.func.isRequired
};

PreviousStepButton.propTypes = {
    previousStep: PropTypes.func.isRequired
};