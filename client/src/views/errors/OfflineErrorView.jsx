import React from 'react';
import {Container, Row} from "react-bootstrap";
import Col from "react-bootstrap/Col";

const OfflineErrorView = (props) => {
    return <React.Fragment>
        <Container>
            <Row className="vertically-center-error text-center">
                <Col md={5} className="d-md-block d-none">
                    {props.iconMd}
                </Col>
                <Col sm={12} className="d-md-none d-block">
                    {props.iconSm}
                </Col>
                <Col md={7} sm={12} className="text-left d-md-block d-none mt-5">
                    <h1 className="display-2">Oh Noes!</h1>
                    <h3 className="h2-responsive">{props.message}</h3>
                </Col>
                <Col sm={12} className="text-center d-md-none d-block">
                    <h1 className="display-3">Oh Noes!</h1>
                    <h3 className="h2-responsive">{props.message}</h3>
                </Col>
            </Row>
        </Container>
    </React.Fragment>
};

export default OfflineErrorView;