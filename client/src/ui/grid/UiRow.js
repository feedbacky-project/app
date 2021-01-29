import React from "react";
import {Row} from "react-bootstrap";

const UiRow = ({noGutters, centered, verticallyCentered, className, children}) => {
    let classes = className;
    if(centered) {
        classes += " justify-content-center";
    }
    if(verticallyCentered) {
        classes += " vertical-center";
    }
    return <Row noGutters={noGutters} className={classes}>
        {children}
    </Row>
};

export default UiRow;