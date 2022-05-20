import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaTimes} from "react-icons/fa";

const DeleteButton = styled(FaTimes)`
  padding: .25rem;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  background-color: #383c41;
  position: absolute;
  transform: translate(${props => props.offsetx}, ${props => props.offsety});
  
  &:hover {
    transform: translate(${props => props.offsetx}, ${props => props.offsety}) var(--hover-transform-scale-lg);
  }
`;

const UiElementDeleteButton = (props) => {
    const {id, tooltipName, onClick, offsetX = "-6px", offsetY = "-6px"} = props;

    return <OverlayTrigger overlay={<Tooltip id={id}>{tooltipName}</Tooltip>}>
        <DeleteButton onClick={onClick} offsetx={offsetX} offsety={offsetY}/>
    </OverlayTrigger>
};

export {UiElementDeleteButton};

UiElementDeleteButton.propTypes = {
    id: PropTypes.string.isRequired,
    tooltipName: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    offsetX: PropTypes.string,
    offsetY: PropTypes.string
};