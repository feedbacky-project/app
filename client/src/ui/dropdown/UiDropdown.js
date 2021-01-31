import React from "react";
import {Dropdown} from "react-bootstrap";

const UiDropdown = (props) => {
    const {className, toggleClassName, toggle, children} = props;
    return <Dropdown alignRight onClick={e => e.preventDefault()} className={className}>
        {/* dropdowns aren't accessible anyway, tabindex -1 removes them from tabbing order  */}
        <Dropdown.Toggle tabIndex={-1} variant={""} className={toggleClassName}>
            {toggle}
        </Dropdown.Toggle>
        <Dropdown.Menu>
            {children}
        </Dropdown.Menu>
    </Dropdown>
};

export {UiDropdown};