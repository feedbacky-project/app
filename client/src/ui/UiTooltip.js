import React from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

const UiTooltip = (props) => {
    const {id, text, children} = props;
    return <OverlayTrigger overlay={<Tooltip id={id}>{text}</Tooltip>}>
        {children}
    </OverlayTrigger>
};

export {UiTooltip};