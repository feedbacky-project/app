import React from "react";
import {Col} from "react-bootstrap";

const UiCol = (props) => {
    const {children, ...otherProps} = props;
    return <Col {...otherProps}>
        {children}
    </Col>
};

export {UiCol};