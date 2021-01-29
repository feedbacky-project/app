import AppContext from "context/AppContext";
import React, {useContext} from "react";
import {Button} from "react-bootstrap";
import tinycolor from "tinycolor2";
import styled from "@emotion/styled";

export const PageButton = styled(Button)`
  color: white;
  box-shadow: var(--box-shadow);
  transition: var(--hover-transition);
  
  &:hover, &:active {
    color: white;
    box-shadow: 0 4px 6px 0 hsla(0, 0%, 0%, .3);
    transform: var(--hover-transform-scale);
  }
`;

const UiButton = ({children, color = null, className, style, disabled, onClick, size, as, to}) => {
    const {getTheme, user} = useContext(AppContext);
    if(color == null) {
        color = getTheme();
    }
    if (user.darkMode) {
        color = color.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(color, "#282828") < 2.5) {
            color = color.lighten(25);
        }
        return <PageButton as={as} to={to} variant={""} size={size} style={{color: color, fontWeight: "bold", backgroundColor: color.clone().setAlpha(.1), style}}
                       disabled={disabled} className={className} onClick={onClick}>{children}</PageButton>
    }
    return <PageButton as={as} to={to}  variant={""} size={size} style={{backgroundColor: color, style}} disabled={disabled} className={className} onClick={onClick}>{children}</PageButton>
};

export default UiButton;