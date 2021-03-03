import styled from "@emotion/styled";
import {WCAG_AA_CONTRAST} from "App";
import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import {Button} from "react-bootstrap";
import tinycolor from "tinycolor2";

export const PageButton = styled(Button)`
  color: white;
  box-shadow: var(--box-shadow);
  transition: var(--hover-transition);
  border-radius: var(--border-radius);
  border: 1px solid transparent;
  
  &:focus {
    outline: 1px dotted white;
  }
  
  &:hover, &:active {
    color: white;
    transform: var(--hover-transform-scale-sm);
  }
  
  .dark & {
    box-shadow: var(--dark-box-shadow) !important;
  }
`;

const UiButton = (props) => {
    const {getTheme, user} = useContext(AppContext);
    const {children, label, color = getTheme(), style, innerRef, ...otherProps} = props;
    let buttonColor = color;
    if (user.darkMode) {
        buttonColor = buttonColor.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(color, "#282828") < WCAG_AA_CONTRAST) {
            buttonColor = buttonColor.lighten(25);
        }
        return <PageButton aria-label={label} variant={""} style={{color: buttonColor, fontWeight: "bold", backgroundColor: buttonColor.clone().setAlpha(.1), style}}
                           ref={innerRef} {...otherProps}>{children}</PageButton>
    } else {
        if (tinycolor.readability(buttonColor, "#fff") < WCAG_AA_CONTRAST) {
            buttonColor = buttonColor.darken(10);
        }
    }
    return <PageButton aria-label={label} variant={""} style={{backgroundColor: buttonColor.clone().setAlpha(.1), color: buttonColor, fontWeight: "500", style}} ref={innerRef} {...otherProps}>{children}</PageButton>
};

UiButton.propTypes = {
  label: PropTypes.string.isRequired,
};

export {UiButton};