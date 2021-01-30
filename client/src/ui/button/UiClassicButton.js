import styled from "@emotion/styled";
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
    const {children, ...otherProps} = props;
    return <ClassicButton {...otherProps}>{children}</ClassicButton>
};

export {UiClassicButton};