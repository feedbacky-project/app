import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";

const Image = styled.img`
  vertical-align: middle;
  border-radius: ${props => props.borderRadius};
  padding: ${props => props.padding};
`;

const UiImage = (props) => {
    const {roundedCircle, rounded, thumbnail, className, onError = () => void 0, innerRef, ...otherProps} = props;
    let borderRadius = 0;
    const defaultRadius = getComputedStyle(document.documentElement).getPropertyValue("--border-radius");

    if (rounded) {
        borderRadius = defaultRadius;
    }
    if (roundedCircle) {
        borderRadius = "50%";
    }
    let padding = 0;
    if (thumbnail) {
        padding = ".25rem";
        if (borderRadius === 0) {
            borderRadius = defaultRadius;
        }
    }
    return <Image className={className} borderRadius={borderRadius} padding={padding} onError={onError} ref={innerRef} {...otherProps}/>
};

UiImage.propTypes = {
    rounded: PropTypes.bool,
    roundedCircle: PropTypes.bool,
    thumbnail: PropTypes.bool
};

export {UiImage};