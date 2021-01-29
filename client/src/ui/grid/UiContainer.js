import React from "react";
import {Container} from "react-bootstrap";

const UiContainer = ({className, children}) => {
    return <Container className={className}>
        {children}
    </Container>
};

export default UiContainer;