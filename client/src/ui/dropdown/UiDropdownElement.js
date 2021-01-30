import React from "react";
import {Dropdown} from "react-bootstrap";

const UiDropdownElement = (props) => {
    const {children, ...otherProps} = props;
    return <Dropdown.Item {...otherProps}>{children}</Dropdown.Item>
};

export {UiDropdownElement};