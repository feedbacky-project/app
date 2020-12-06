import React, {useContext} from 'react';
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {Container, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";
import AppContext from "context/app-context";

const ErrorView = ({icon, message, notes = "", crash = false, onBackButtonClick = () => {}}) => {
    const context = useContext(AppContext);
    return <Container>
        <Row className="vertical-center">
            <Col className="text-md-left justify-content-center text-center d-sm-flex d-block">
                <div className="mr-sm-5 mr-0">{icon}</div>
                <div>
                    <h1 className="display-4">Oh Noes!</h1>
                    <h3 className="mb-0">{message}</h3>
                    {notes && <div className="my-1">{notes}</div>}
                    <Link to="/" onClick={onBackButtonClick}>
                        <Button variant="danger" className="mx-0 py-3 px-4 mt-1">
                            Back to the Main Page
                        </Button>
                    </Link>
                    {crash && <Button variant="warning" className="mx-0 py-3 px-4 mt-1 ml-3" onClick={() => context.hardResetData()}>
                        Reset Data
                    </Button>}
                </div>
            </Col>
        </Row>
    </Container>
};

ErrorView.propTypes = {
    icon: PropTypes.object.isRequired,
    message: PropTypes.string.isRequired,
    notes: PropTypes.string,
    onBackButtonClick: PropTypes.func
};

export default ErrorView;