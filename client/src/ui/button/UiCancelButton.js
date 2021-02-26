import styled from "@emotion/styled";
import React from "react";
import {Button} from "react-bootstrap";

const CancelButton = styled(Button)`
  transition: var(--hover-transition) !important;
  color: hsla(0, 0%, 0%, .6);

  &:focus {
    outline: 1px dotted white;
  }

  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }

  &:hover {
    color: hsla(0, 0%, 0%, .6);
    transform: var(--hover-transform-scale-sm);
  }
`;

const UiCancelButton = (props) => {
    const {children, innerRef, ...otherProps} = props;
    return <CancelButton aria-label={"Cancel"} variant={"link"} ref={innerRef} {...otherProps}>{children}</CancelButton>
};

export {UiCancelButton};