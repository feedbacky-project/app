import styled from "@emotion/styled";
import React from "react";

const Image = styled.img`
    vertical-align: middle;
`;

const UiImage = ({width, height, alt, src, roundedCircle, rounded, className, style, onError = e => void 0}) => {
    let classes = className;
    if (rounded) {
        classes += " rounded";
    }
    if (roundedCircle) {
        classes += " rounded-circle";
    }
    return <Image alt={alt} className={classes} style={style} src={src} width={width} height={height} onError={onError}/>
};

export {UiImage};