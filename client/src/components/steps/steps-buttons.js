import React from 'react';
import {FaAngleLeft, FaAngleRight} from "react-icons/all";
import {Button} from "react-bootstrap";
import PropTypes from 'prop-types';

export const NextStepButton = (props) => {
  return <Button variant="" style={{backgroundColor: "#0994f6"}} className="text-white pr-1 ml-2" onClick={props.nextStep}>Next <FaAngleRight/></Button>
};

export const PreviousStepButton = (props) => {
    return <Button variant="" style={{backgroundColor: "#0994f6"}} className="text-white pl-1" onClick={props.previousStep}><FaAngleLeft/> Back</Button>
};

NextStepButton.propTypes = {
    nextStep: PropTypes.func.isRequired
};

PreviousStepButton.propTypes = {
    previousStep: PropTypes.func.isRequired
};