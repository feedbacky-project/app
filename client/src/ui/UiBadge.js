import styled from "@emotion/styled";
import {WCAG_AA_CONTRAST} from "App";
import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import tinycolor from "tinycolor2";

const Badge = styled.div`
    display: inline-block;
    padding: .2rem .5rem;
    box-shadow: none;
    border-width: 0;
    border-radius: var(--border-radius);
    font-size: .7rem;
    line-height: 1;
    text-align: center;
    color: white;
    white-space: nowrap;
    vertical-align: baseline;
    background-color: ${props => props.theme};
`;

const UiBadge = (props) => {
    const context = useContext(AppContext);
    const {color = context.getTheme(), children, innerRef, style, ...otherProps} = props;
    let badgeColor = color;
    if (context.user.darkMode) {
        badgeColor = badgeColor.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(badgeColor, "#282828") < WCAG_AA_CONTRAST) {
            badgeColor = badgeColor.lighten(25);
        }
        return <Badge theme={badgeColor.clone().setAlpha(.1).toString()} style={{color: badgeColor, fontWeight: "bold", ...style}} ref={innerRef} {...otherProps}>{children}</Badge>
    } else {
        if (tinycolor.readability(badgeColor, "#fff") < WCAG_AA_CONTRAST) {
            badgeColor = badgeColor.darken(10);
        }
    }
    return <Badge theme={badgeColor.toString()} style={{fontWeight: "500", color: badgeColor.toString(), backgroundColor: badgeColor.setAlpha(.1).toString(), ...style}} ref={innerRef} {...otherProps}>{children}</Badge>
};

export {UiBadge};

UiBadge.propTypes = {
    color: PropTypes.object
};