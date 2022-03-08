import React from "react";
import {Col} from "react-bootstrap";

const UiCol = (props) => {
    const {children, innerRef, ...otherProps} = props;

    return <Col ref={innerRef} {...otherProps}>
        {children}
    </Col>
};

export {UiCol};