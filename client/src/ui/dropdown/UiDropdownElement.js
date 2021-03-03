import styled from "@emotion/styled";
import React from "react";
import {Dropdown} from "react-bootstrap";

const DropdownItem = styled(Dropdown.Item)`
  font-size: 14px;
  padding: 4px 10px;
  transition: var(--hover-transition);
  
  &:active {
    background-color: hsla(0, 0%, 0%, .075);
    color: var(--font-color);
  }

  &:hover {
    background-color: var(--hover);
  }
  
  .dark & {
    box-shadow: var(--dark-box-shadow);
    background-color: var(--dark-quaternary);
    color: var(--dark-font-color);
  }
  
  .dark &:hover {
    background-color: var(--dark-hover);
  }
`;

const UiDropdownElement = (props) => {
    const {children, ...otherProps} = props;
    return <DropdownItem {...otherProps}>{children}</DropdownItem>
};

export {UiDropdownElement};