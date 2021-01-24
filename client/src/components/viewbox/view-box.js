import React from 'react';
import {Card, Col, Row} from "react-bootstrap";
import PropTypes from "prop-types";

const ViewBox = ({theme, title, description, children}) => {
    return <React.Fragment>
        <Card className="view-box" style={{backgroundColor: theme}}>
            <h3 className="mb-0">{title}</h3>
            <div>{description}</div>
        </Card>
        <Col className="view-box-bg">
            <Row className="py-4 px-3 px-0 pt-5 mb-3">
                {children}
            </Row>
        </Col>
    </React.Fragment>
};

export default ViewBox;

ViewBox.propTypes = {
    theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired
};