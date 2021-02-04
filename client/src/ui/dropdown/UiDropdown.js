import PropTypes from "prop-types";
import React from "react";
import {Dropdown} from "react-bootstrap";
import styled from "@emotion/styled";

export const DropdownToggle = styled(Dropdown.Toggle)`
  &::after {
    display: none; //disable bootstrap dropdown caret
  }
`;

export const DropdownMenu = styled(Dropdown.Menu)`
  padding: .2rem 0;
  
  .dark & {
    box-shadow: var(--dark-box-shadow);
    background-color: var(--dark-quaternary);
    color: var(--dark-font-color);
  }
`;

const UiDropdown = (props) => {
    const {className = null, toggleClassName = null, toggle, label, children} = props;
    return <Dropdown alignRight onClick={e => e.preventDefault()} className={className}>
        {/* dropdowns aren't accessible anyway, tabindex -1 removes them from tabbing order  */}
        <DropdownToggle aria-label={label} tabIndex={-1} variant={""} className={toggleClassName}>
            {toggle}
        </DropdownToggle>
        <DropdownMenu>
            {children}
        </DropdownMenu>
    </Dropdown>
};

UiDropdown.propTypes = {
    label: PropTypes.string.isRequired,
    toggle: PropTypes.object.isRequired
};

export {UiDropdown};