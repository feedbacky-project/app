import styled from "@emotion/styled";
import React, {useContext} from "react";
import {UiThemeContext} from "ui/index";

const HorizontalRule = styled.hr`
  border-top: 2px solid ${props => props.theme.toString()};
  .dark & {
    background-color: var(--secondary);
  }
`;

const UiHorizontalRule = (props) => {
    const {getTheme} = useContext(UiThemeContext);
    const {theme = getTheme().setAlpha(.1)} = props;
    return <HorizontalRule theme={theme} {...props}/>
};

export {UiHorizontalRule};