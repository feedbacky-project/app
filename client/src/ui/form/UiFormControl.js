import PropTypes from "prop-types";
import React from "react";
import Form from "react-bootstrap/Form";

const UiFormControl = (props) => {
    const {label, ...otherProps} = props;
    return <Form.Control style={{minHeight: 38, resize: "none"}} required aria-label={label} {...otherProps}/>
};

UiFormControl.propTypes = {
    label: PropTypes.string.isRequired,
};

export {UiFormControl};