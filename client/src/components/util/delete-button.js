import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaTimes} from "react-icons/all";
import PropTypes from "prop-types";

const DeleteButton = ({id, tooltipName, onClick, offsetX = "-6px", offsetY = "-6px"}) => {
    return <OverlayTrigger overlay={<Tooltip id={id}>{tooltipName}</Tooltip>}>
        <FaTimes className="bg-dark p-1 text-white rounded-circle cursor-click"
                 onClick={onClick} style={{position: "absolute", transform: "translate(" + offsetX + "," + offsetY + ")"}}/>
    </OverlayTrigger>
};

export default DeleteButton;

DeleteButton.propTypes = {
    id: PropTypes.string.isRequired,
    tooltipName: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    offsetX: PropTypes.string,
    offsetY: PropTypes.string
};