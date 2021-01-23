import React from "react";
import {Dropdown} from "react-bootstrap";
import {FaAngleDown} from "react-icons/all";

const PageSelectableDropdown = ({id, className, currentValue, values}) => {
    return <Dropdown className={className} style={{zIndex: 1}}>
        <Dropdown.Toggle id={id} variant="" className="search-dropdown-bar btn btn-link text-dark move-top-1px">
                <span>{currentValue}</span>
            <FaAngleDown/>
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>{values}</Dropdown.Menu>
    </Dropdown>
};

export default PageSelectableDropdown;