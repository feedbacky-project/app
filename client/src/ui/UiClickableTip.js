import styled from "@emotion/styled";
import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/all";

const PopoverBox = styled(Popover)`
  .dark & {
    background-color: var(--dark-quaternary) !important;
    color: var(--dark-font-color) !important;
    box-shadow: var(--dark-box-shadow);
  }
`;

const PopoverBody = styled(Popover.Content)`
  border-bottom-left-radius: .35rem;
  border-bottom-right-radius: .35rem;
  
  .dark & {
    background-color: var(--dark-quaternary) !important;
    color: var(--dark-font-color) !important;
  }
`;

const PopoverHeader = styled(Popover.Title)`
  text-align: center;
  font-weight: 450;
  
  .dark & {
    background-color: var(--dark-tertiary);
  }
`;

const UiClickableTip = ({id, title, description, icon = <FaQuestionCircle className={"fa-xs cursor-pointer text-black-50 align-top hoverable-option"}/>}) => {
    return <OverlayTrigger
        trigger={"click"} placement={"top"} rootClose={true} rootCloseEvent={"click"}
        overlay={
            <PopoverBox id={id}>
                <PopoverHeader>{title}</PopoverHeader>
                <PopoverBody>
                    {description}
                </PopoverBody>
            </PopoverBox>
        }>
        {icon}
    </OverlayTrigger>
};

export default UiClickableTip;

UiClickableTip.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    icon: PropTypes.object
};