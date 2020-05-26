import React, {useContext} from "react";
import PropTypes from "prop-types";
import AppContext from "context/app-context";
import {Badge} from "react-bootstrap";

const PageBadge = ({color, text, className = ""}) => {
    const context = useContext(AppContext);
    if (context.user.darkMode) {
        color = color.lighten(10);
        return <Badge color="" style={{color: color, fontWeight: "bold", backgroundColor: color.clone().setAlpha(.2)}} className={className}>{text}</Badge>
    } else {
        return <Badge color="" style={{backgroundColor: color}} className={className}>{text}</Badge>
    }
};

export default PageBadge;

PageBadge.propTypes = {
    color: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    className: PropTypes.string
};