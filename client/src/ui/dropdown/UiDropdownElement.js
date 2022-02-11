import styled from "@emotion/styled";
import React from "react";
import {Dropdown} from "react-bootstrap";

const DropdownItem = styled(Dropdown.Item)`
  font-size: 14px;
  padding: 4px 10px;
  transition: var(--hover-transition);
  box-shadow: var(--box-shadow);
  color: var(--font-color) !important;
  
  &:active {
    background-color: hsla(0, 0%, 0%, .075);
  }

  &:hover, &:focus {
    background-color: var(--hover) !important;
  }
`;

const UiDropdownElement = (props) => {
    const {children, ...otherProps} = props;
    return <DropdownItem {...otherProps}>{children}</DropdownItem>
};

export {UiDropdownElement};