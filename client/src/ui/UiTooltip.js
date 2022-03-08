import PropTypes from "prop-types";
import React from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

const UiTooltip = (props) => {
    const {id, text, children} = props;

    const overlay = <Tooltip id={id}>{text}</Tooltip>;
    return <OverlayTrigger overlay={overlay}>
        {children}
    </OverlayTrigger>
};

UiTooltip.propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.string
};

export {UiTooltip};