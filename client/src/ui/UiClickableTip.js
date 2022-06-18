import styled from "@emotion/styled";
import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/fa";
import {UiHoverableIcon} from "ui/index";

const PopoverBox = styled(Popover)`
  box-shadow: var(--box-shadow);
  background-color: var(--quaternary);
  color: var(--font-color);
`;

const PopoverBody = styled(Popover.Content)`
  border-bottom-left-radius: .35rem;
  border-bottom-right-radius: .35rem;
  color: var(--font-color);
`;

const PopoverHeader = styled(Popover.Title)`
  text-align: center;
  font-weight: 450;

  .dark & {
    background-color: var(--tertiary);
  }
`;

const UiClickableTip = (props) => {
    const {id, title, description, icon = <UiHoverableIcon as={FaQuestionCircle} className={"text-black-60 align-top ml-1"}/>} = props;

    const overlay = <PopoverBox id={id}>
        <PopoverHeader>{title}</PopoverHeader>
        <PopoverBody>
            {description}
        </PopoverBody>
    </PopoverBox>;
    return <OverlayTrigger trigger={"click"} placement={"top"} rootClose={true} rootCloseEvent={"click"} overlay={overlay}>{icon}</OverlayTrigger>
};

export {UiClickableTip};

UiClickableTip.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    icon: PropTypes.object
};