import styled from "@emotion/styled";
import {AppContext} from "context";
import React, {useContext} from "react";
import {BasePageButton} from "ui/button/UiButton";

const CancelButton = styled(BasePageButton)`
  color: hsla(0, 0%, 0%, .6);
  font-weight: 500;

  &:focus {
    outline: 1px dotted white;
  }

  &:hover {
    background-color: hsla(0,0%,0%,.1);
  }

  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
    
    &:hover {
      background-color: hsla(0, 0%, 95%, .1);
    }
  }
  
`;

const UiCancelButton = (props) => {
    const {children, innerRef, ...otherProps} = props;
    const {getTheme} = useContext(AppContext);
    return <CancelButton theme={getTheme()} aria-label={"Cancel"} ref={innerRef} {...otherProps}>{children}</CancelButton>
};

export {UiCancelButton};