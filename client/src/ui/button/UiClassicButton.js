import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import {PageButton} from "ui/button/UiButton";
import {UiThemeContext} from "ui/index";

const ClassicButton = styled(PageButton)`
  color: var(--font-color);
  
  &:hover, &:focus {
    color: var(--font-color);
    border-color: transparent !important;
  }
`;

const UiClassicButton = (props) => {
    const {children, label, innerRef, ...otherProps} = props;
    const {getTheme} = useContext(UiThemeContext);

    return <ClassicButton theme={getTheme().clone()} aria-label={label} ref={innerRef} {...otherProps}>{children}</ClassicButton>
};

UiClassicButton.propTypes = {
    label: PropTypes.string.isRequired,
};

export {UiClassicButton};