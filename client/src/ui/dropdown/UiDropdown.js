import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";
import {Dropdown} from "react-bootstrap";

export const DropdownToggle = styled(Dropdown.Toggle)`
  &::after {
    display: none; //disable bootstrap dropdown caret
  }
`;

export const DropdownMenu = styled(Dropdown.Menu)`
  padding: .2rem 0;
  box-shadow: var(--box-shadow);
  color: var(--tertiary);
  max-height: 350px;
  overflow-y: auto;
  scrollbar-width: thin; /* firefox property */
   &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
    background: hsl(0, 0%, 94%);
  }
  
  .dark & {
    background-color: var(--quaternary);
    color: var(--font-color);
    scrollbar-color: var(--hover) var(--tertiary); /* firefox property */
    &::-webkit-scrollbar {
      background: var(--tertiary);
    }
    &::-webkit-scrollbar-thumb {
      background: var(--hover);
    }
  }
`;

const UiDropdown = (props) => {
    const {className = null, toggleClassName = null, menuClassName = null, toggle, label, children, style, menuStyle, dataIdToggle, dataIdMenu} = props;

    return <Dropdown alignRight onClick={e => e.preventDefault()} className={className} style={style}>
        {/* dropdowns aren't accessible anyway, tabindex -1 removes them from tabbing order  */}
        <DropdownToggle aria-label={label} tabIndex={-1} variant={""} className={toggleClassName} data-id={dataIdToggle}>
            {toggle}
        </DropdownToggle>
        <DropdownMenu className={menuClassName} style={menuStyle} data-id={dataIdMenu}>
            {children}
        </DropdownMenu>
    </Dropdown>
};

UiDropdown.propTypes = {
    label: PropTypes.string.isRequired,
    toggle: PropTypes.object.isRequired
};

export {UiDropdown};