import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaTimes} from "react-icons/all";
import PropTypes from "prop-types";

const DeleteButton = (props) => {
    return <OverlayTrigger overlay={<Tooltip id={props.id}>{props.tooltipName}</Tooltip>}>
        <FaTimes className="bg-dark p-1 text-white rounded-circle cursor-click"
                 onClick={props.onClick}
                 style={{position: "absolute", transform: "translate(" + props.offsetX + "," + props.offsetY + ")"}}/>
    </OverlayTrigger>
};

export default DeleteButton;

DeleteButton.defaultProps = {
  offsetX: "-6px",
  offsetY: "-6px"
};

DeleteButton.propTypes = {
    id: PropTypes.string.isRequired,
    tooltipName: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    offsetX: PropTypes.string,
    offsetY: PropTypes.string
};