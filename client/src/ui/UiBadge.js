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
    vertical-align: baseline
`;

// fixme sneaky workaround for missing context when inserting html directly
const UiBadge = ({color = null, text, className = "", context = null}) => {
    let appContext = useContext(AppContext);
    if (context != null) {
        appContext = context;
    }
    if(color == null) {
        color = appContext.getTheme();
    }
    if (appContext.user.darkMode) {
        color = color.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(color, "#282828") < 2.5) {
            color = color.lighten(25);
        }
        return <Badge color={""} style={{color: color, fontWeight: "bold", backgroundColor: color.clone().setAlpha(.1)}} className={className}>{text}</Badge>
    }
    return <Badge color={""} style={{backgroundColor: color}} className={className}>{text}</Badge>
};

export default UiBadge;

UiBadge.propTypes = {
    color: PropTypes.object,
    text: PropTypes.string.isRequired,
    className: PropTypes.string
};