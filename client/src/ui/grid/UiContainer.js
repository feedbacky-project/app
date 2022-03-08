import React from "react";
import {Container} from "react-bootstrap";

const UiContainer = (props) => {
    const {children, innerRef, ...otherProps} = props;

    return <Container ref={innerRef} {...otherProps}>
        {children}
    </Container>
};

export {UiContainer};