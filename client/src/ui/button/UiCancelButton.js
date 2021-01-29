import React from "react";
import {Button} from "react-bootstrap";
import styled from "@emotion/styled";

const CancelButton = styled(Button)`
  transition: var(--hover-transition) !important;
  color: hsla(0, 0%, 0%, .6);

  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }

  &:hover {
    color: hsla(0, 0%, 0%, .6);
    transform: var(--hover-transform-scale);
  }
`;

const UiCancelButton = ({children, className, style, onClick, size, as, to}) => {
    return <CancelButton variant={"link"} size={size} style={style} className={className} onClick={onClick} as={as} to={to}>{children}</CancelButton>
};

export default UiCancelButton;