import React from 'react';
import {Card, Col, Row} from "react-bootstrap";
import PropTypes from "prop-types";

const ViewBox = (props) => {
    return <React.Fragment>
        <Card className="text-white px-4 mx-4 py-3 view-box"
              style={{backgroundColor: props.theme, position: "relative", top: "35px", zIndex: 1}}>
            <h3 className="mb-0">{props.title}</h3>
            <div>{props.description}</div>
        </Card>
        <Col className="view-box-bg rounded shadow">
            <Row className="py-4 px-sm-2 px-0 pt-5 mb-3">
                {props.children}
            </Row>
        </Col>
    </React.Fragment>
};

export default ViewBox;

ViewBox.propTypes = {
    theme: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};