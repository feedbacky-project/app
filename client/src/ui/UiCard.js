import React from "react";
import {Card} from "react-bootstrap";

const UiCard = (props) => {
    const {className, bodyClassName, bodyAs, children, innerRef, ...otherProps} = props;
    return <Card className={className} ref={innerRef} {...otherProps}>
        <Card.Body as={bodyAs} className={bodyClassName}>
            {children}
        </Card.Body>
    </Card>
};

export {UiCard};