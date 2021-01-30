import AppContext from "context/AppContext";
import React, {useContext} from "react";
import {Button} from "react-bootstrap";
import tinycolor from "tinycolor2";
import styled from "@emotion/styled";

export const PageButton = styled(Button)`
  color: white;
  box-shadow: var(--box-shadow);
  transition: var(--hover-transition);
  
  &:focus {
    outline: 1px dotted white;
  }
  
  &:hover, &:active {
    color: white;
    box-shadow: 0 4px 6px 0 hsla(0, 0%, 0%, .3);
    transform: var(--hover-transform-scale);
  }
`;

const UiButton = (props) => {
    const {getTheme, user} = useContext(AppContext);
    const {children, color = getTheme(), style, ...otherProps} = props;
    let buttonColor = color;
    if (user.darkMode) {
        buttonColor = buttonColor.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(color, "#282828") < 2.5) {
            buttonColor = buttonColor.lighten(25);
        }
        return <PageButton variant={""} style={{color: buttonColor, fontWeight: "bold", backgroundColor: buttonColor.clone().setAlpha(.1), style}} {...otherProps}>{children}</PageButton>
    }
    return <PageButton variant={""} style={{backgroundColor: buttonColor, style}} {...otherProps}>{children}</PageButton>
};

export {UiButton};