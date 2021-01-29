import React from "react";
import {Dropdown} from "react-bootstrap";

const UiDropdown = ({className, toggleClassName, toggle, children}) => {
    return <Dropdown alignRight onClick={e => e.preventDefault()} className={className}>
        <Dropdown.Toggle variant={""} className={toggleClassName}>
            {toggle}
        </Dropdown.Toggle>
        <Dropdown.Menu>
            {children}
        </Dropdown.Menu>
    </Dropdown>
};

export default UiDropdown;