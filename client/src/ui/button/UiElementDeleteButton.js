import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaTimes} from "react-icons/all";

const DeleteButton = styled(FaTimes)`
  padding: .25rem;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  background-color: #383c41;
  position: absolute;
  transform: translate(-6px, -6px);
  
  &:hover {
    transform: translate(-6px, -6px) var(--hover-transform-scale-lg);
  }
`;

const UiElementDeleteButton = (props) => {
    const {id, tooltipName, onClick} = props;
    return <OverlayTrigger overlay={<Tooltip id={id}>{tooltipName}</Tooltip>}>
        <DeleteButton onClick={onClick}/>
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