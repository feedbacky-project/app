import AppContext from "context/AppContext";
import React, {useContext} from "react";
import {Dropdown} from "react-bootstrap";
import {FaAngleDown} from "react-icons/all";
import styled from "@emotion/styled";
import tinycolor from "tinycolor2";

const SelectableDropdown = styled.div`
  margin: 0;
  padding: 0;
  font-weight: bold;
  text-decoration: underline;
  color: var(--font-color);

  &:hover {
    text-decoration: underline;
    color: var(--font-color);
  }
  
  .dark & {
    background-color: var(--dark-tertiary);
    padding: 0 .5rem;
    text-decoration: none;
    box-shadow: var(--dark-box-shadow) !important;

    &:hover {
      text-decoration: none;
      background-color: var(--dark-hover);
    }
  }
`;

const UiSelectableDropdown = (props) => {
    const {user, getTheme} = useContext(AppContext);
    const {id, className, currentValue, values} = props;
    let children;
    if(user.darkMode) {
        let color = getTheme().lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(color, "#282828") < 2.5) {
            color = color.lighten(25);
        }
        children = <Dropdown.Toggle as={SelectableDropdown} id={id} variant={""} className={"btn btn-link move-top-1px"} style={{backgroundColor: getTheme().setAlpha(.1)}}>
            <span style={{color, marginRight: "0.2rem"}}>{currentValue}</span>
            <FaAngleDown/>
        </Dropdown.Toggle>
    } else {
        children = <Dropdown.Toggle as={SelectableDropdown} id={id} variant={""} className={"btn btn-link move-top-1px"}>
            <span>{currentValue}</span>
            <FaAngleDown/>
        </Dropdown.Toggle>
    }
    return <Dropdown className={className} style={{zIndex: 1}}>
        {children}
        <Dropdown.Menu alignRight>{values}</Dropdown.Menu>
    </Dropdown>
};

export {UiSelectableDropdown};