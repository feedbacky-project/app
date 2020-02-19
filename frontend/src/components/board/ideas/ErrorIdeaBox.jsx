import React from 'react';
import {Card} from "react-bootstrap";
import "./ErrorIdeaBox.css";

const ErrorIdeaBox = (props) => {
    return <Card className="my-2 container col idea-error-bg" style={{borderRadius: 0, display: `block`}}>
        <Card.Body className="p-4 row justify-content-center">
            <strong>
                {props.children}
            </strong>
        </Card.Body>
    </Card>
};

export default ErrorIdeaBox;