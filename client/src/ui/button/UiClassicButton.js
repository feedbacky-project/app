import React from "react";
import {PageButton} from "ui/button/UiButton";

const UiClassicButton = ({children, className, style, disabled, onClick, size, as, to}) => {
    return <PageButton as={as} to={to} variant={""} size={size} style={{style}} disabled={disabled} className={className} onClick={onClick}>{children}</PageButton>
};

export default UiClassicButton;