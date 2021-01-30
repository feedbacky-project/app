import React from "react";
import {Container} from "react-bootstrap";

const UiContainer = (props) => {
    const {children, ...otherProps} = props;
    return <Container {...otherProps}>
        {children}
    </Container>
};

export {UiContainer};