import React from "react";
import PropTypes from "prop-types";
import {Card} from "react-bootstrap";

const SetupCard = ({icon, text, onClick, className = ""}) => {
    return <Card className={className} style={{minWidth: 175}} onClick={onClick}>
        <Card.Body className="text-center">
            {icon}
            <br className="my-3"/>
            <strong style={{fontSize: "1.5rem"}}>{text}</strong>
        </Card.Body>
    </Card>
};

export default SetupCard;

SetupCard.propTypes = {
    icon: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
};