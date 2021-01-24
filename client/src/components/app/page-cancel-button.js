import React from "react";
import {Button} from "react-bootstrap";

const PageCancelButton = ({children, className, style, onClick, size, as, to}) => {
    return <Button variant="link" size={size} style={style} className={"text-black-60 btn-cancel " + className} onClick={onClick} as={as} to={to}>{children}</Button>
};

export default PageCancelButton;