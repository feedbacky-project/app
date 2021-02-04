import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import tinycolor from "tinycolor2";
import styled from "@emotion/styled";

const Badge = styled.div`
    display: inline-block;
    padding: .2rem .5rem;
    box-shadow: none;
    border-width: 0;
    border-radius: .35rem;
    font-size: .7rem;
    line-height: 1;
    text-align: center;
    color: white;
    white-space: nowrap;
    vertical-align: baseline;
    background-color: ${props => props.theme};
`;

// fixme sneaky workaround for missing context when inserting html directly
const UiBadge = (props) => {
    const {context = null} = props;
    let appContext = useContext(AppContext);
    if (context != null) {
        appContext = context;
    }
    const {color = appContext.getTheme(), children, ...otherProps} = props;
    let badgeColor = color;
    if (appContext.user.darkMode) {
        badgeColor = badgeColor.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(badgeColor, "#282828") < 2.5) {
            badgeColor = badgeColor.lighten(25);
        }
        return <Badge theme={badgeColor.clone().setAlpha(.1).toString()} style={{color: badgeColor, fontWeight: "bold"}} {...otherProps}>{children}</Badge>
    }
    return <Badge theme={badgeColor.toString()} {...otherProps}>{children}</Badge>
};

export {UiBadge};

UiBadge.propTypes = {
    color: PropTypes.object
};