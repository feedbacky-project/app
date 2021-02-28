import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";
import {PageButton} from "ui/button/UiButton";

const ClassicButton = styled(PageButton)`
  color: var(--font-color);
  
  &:hover, &:focus {
    color: var(--font-color);
    border-color: transparent !important;
  }
`;

const UiClassicButton = (props) => {
    const {children, label, innerRef, ...otherProps} = props;
    return <ClassicButton aria-label={label} ref={innerRef} {...otherProps}>{children}</ClassicButton>
};

UiClassicButton.propTypes = {
    label: PropTypes.string.isRequired,
};

export {UiClassicButton};