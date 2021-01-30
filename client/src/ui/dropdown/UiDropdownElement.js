import React from "react";
import {Dropdown} from "react-bootstrap";

const UiDropdownElement = ({onClick, className, children, as, to}) => {
    return <Dropdown.Item onClick={onClick} className={className} as={as} to={to}>{children}</Dropdown.Item>
};

export {UiDropdownElement};