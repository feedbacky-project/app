import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";
import {PageButton} from "ui/button/UiButton";

const ClassicButton = styled(PageButton)`
  background-color: white;
  color: var(--font-color);
  
  &:hover, &:focus {
    background-color: white;
    color: var(--font-color);
    border-color: transparent !important;
  }
`;

const UiClassicButton = (props) => {
    const {children, label, ...otherProps} = props;
    return <ClassicButton aria-label={label} {...otherProps}>{children}</ClassicButton>
};

UiClassicButton.propTypes = {
    label: PropTypes.string.isRequired,
};

export {UiClassicButton};