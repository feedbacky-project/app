import styled from "@emotion/styled";
import {WCAG_AA_CONTRAST} from "App";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import tinycolor from "tinycolor2";
import {UiThemeContext} from "ui/index";

export const BasePageButton = styled.button`
  display: inline-block;
  font-weight: 400;
  font-size: var(--font-size);
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  border-radius: var(--border-radius);
  transition: var(--hover-transition);

  ${props => props.tiny === true &&
          `
      padding: .15rem .25rem !important;
      font-size: .75rem !important;
    `}
  ${props => props.small === true &&
    `
      padding: .25rem .5rem !important;
      font-size: .82031rem !important;
    `}
  ${props => props.disabled === true &&
    `
      opacity: .65;
    `}
`;

export const PageButton = styled(BasePageButton)`
  color: ${props => props.theme.toString()};
  background-color: ${props => props.theme.clone().setAlpha(.1).toString()};
  box-shadow: var(--box-shadow);
  font-weight: bold !important;
  
  &:focus {
    outline: 1px dotted white;
  }
  
  &:hover, &:active {
    color: ${props => props.theme.toString()};
    background-color: ${props => props.theme.clone().setAlpha(.3).toString()} !important;
  }
`;

const UiButton = (props) => {
    const {getTheme, darkMode} = useContext(UiThemeContext);
    const {children, label, color = getTheme(), style, innerRef, ...otherProps} = props;
    let buttonColor = color;

    if (darkMode) {
        buttonColor = buttonColor.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(color, "#282828") < WCAG_AA_CONTRAST) {
            buttonColor = buttonColor.lighten(25);
        }
    } else {
        if (tinycolor.readability(buttonColor, "#fff") < WCAG_AA_CONTRAST) {
            buttonColor = buttonColor.darken(10);
        }
    }
    return <PageButton theme={buttonColor.clone()} aria-label={label} ref={innerRef} style={style} {...otherProps}>{children}</PageButton>
};

UiButton.propTypes = {
    label: PropTypes.string.isRequired,
};

export {UiButton};