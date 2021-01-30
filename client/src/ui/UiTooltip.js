import React from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

const UiTooltip = ({id, text, children}) => {
    return <OverlayTrigger overlay={<Tooltip id={id}>{text}</Tooltip>}>
        {children}
    </OverlayTrigger>
};

export {UiTooltip};