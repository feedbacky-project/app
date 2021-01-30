import styled from "@emotion/styled";
import React from "react";

const Image = styled.img`
    vertical-align: middle;
`;

const UiImage = (props) => {
    const {roundedCircle, rounded, className, onError = () => void 0, ...otherProps} = props;
    let classes = className;
    if (rounded) {
        classes += " rounded";
    }
    if (roundedCircle) {
        classes += " rounded-circle";
    }
    return <Image className={classes} onError={onError} {...otherProps}/>
};

export {UiImage};