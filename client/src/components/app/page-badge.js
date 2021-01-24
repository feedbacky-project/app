import React, {useContext} from "react";
import PropTypes from "prop-types";
import AppContext from "context/app-context";
import {Badge} from "react-bootstrap";
import tinycolor from "tinycolor2";

// fixme sneaky workaround for missing context when inserting html directly
const PageBadge = ({color = null, text, className = "", context = null}) => {
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
        return <Badge color="" style={{color: color, fontWeight: "bold", backgroundColor: color.clone().setAlpha(.1)}} className={className}>{text}</Badge>
    }
    return <Badge color="" style={{backgroundColor: color}} className={className}>{text}</Badge>
};

export default PageBadge;

PageBadge.propTypes = {
    color: PropTypes.object,
    text: PropTypes.string.isRequired,
    className: PropTypes.string
};