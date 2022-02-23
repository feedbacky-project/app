import PropTypes from "prop-types";
import React from "react";
import {Row} from "react-bootstrap";

const UiRow = (props) => {
    const {centered, verticallyCentered, className, children, innerRef, ...otherProps} = props;
    let classes = className;

    if (centered) {
        classes += " justify-content-center";
    }
    if (verticallyCentered) {
        classes += " vertical-center";
    }
    return <Row className={classes} ref={innerRef} {...otherProps}>
        {children}
    </Row>
};

UiRow.propTypes = {
    centered: PropTypes.bool,
    verticallyCentered: PropTypes.bool
};

export {UiRow};