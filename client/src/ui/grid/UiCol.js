import React from "react";
import {Col} from "react-bootstrap";

const UiCol = ({xs, sm, md, lg, xl, className, children, as, to}) => {
    return <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl} className={className} as={as} to={to}>
        {children}
    </Col>
};

export default UiCol;