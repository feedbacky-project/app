import React, {useState} from 'react';
import ErrorNavbar from "../../components/navbars/ErrorNavbar";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {Container, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";
import LoginModal from "../../components/modal/LoginModal";

const ErrorView = (props) => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    return <React.Fragment>
        <LoginModal open={loginModalOpen} image="https://cdn.feedbacky.net/static/img/login-logo.png"
                    boardName={"Feedbacky"} redirectUrl={"me"}
                    onLoginModalClose={() => setLoginModalOpen(false)}/>
        <ErrorNavbar onNotLoggedClick={() => setLoginModalOpen(true)}/>
        <Container>
            <Row className="vertically-center-error text-center">
                <Col md={5} className="d-md-block d-none">
                    {props.iconMd}
                </Col>
                <Col sm={12} className="d-md-none d-block">
                    {props.iconSm}
                </Col>
                <Col md={7} sm={12} className="text-left d-md-block d-none">
                    <h1 className="display-2">Oh Noes!</h1>
                    <h3 className="h2-responsive">{props.message}</h3>
                    <Link to="/">
                        <Button size="lg" variant="" className="text-white mx-0"
                                style={{textTransform: "none", backgroundColor: "#f39c12"}}>
                            Back to the Main Page
                        </Button>
                    </Link>
                </Col>
                <Col sm={12} className="text-center d-md-none d-block">
                    <h1 className="display-3">Oh Noes!</h1>
                    <h3 className="h2-responsive">{props.message}</h3>
                    <Link to="/">
                        <Button size="lg" variant="" className="text-white mx-0"
                                style={{textTransform: "none", backgroundColor: "#f39c12"}}>
                            Back to the Main Page
                        </Button>
                    </Link>
                </Col>
            </Row>
        </Container>
    </React.Fragment>
};

ErrorView.propTypes = {
    iconMd: PropTypes.object,
    iconSm: PropTypes.object,
    message: PropTypes.string
};

export default ErrorView;