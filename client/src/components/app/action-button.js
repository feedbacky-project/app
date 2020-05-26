import React from "react";
import PropTypes from "prop-types";
import {Button} from "react-bootstrap";

const ActionButton = ({text, variant, onClick}) => {
    return <Button variant={variant} className="m-0 mt-sm-0 mt-2" onClick={onClick}>{text}</Button>
};

export default ActionButton;

ActionButton.propTypes = {
    text: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};