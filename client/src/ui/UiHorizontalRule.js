import styled from "@emotion/styled";
import React from "react";

const HorizontalRule = styled.hr`
  border-top: 2px solid ${props => props.theme.setAlpha(.1).toString()};
  .dark & {
    background-color: var(--dark-secondary);
  }
`;

const UiHorizontalRule = (props) => {
    return <HorizontalRule {...props}/>
};

export {UiHorizontalRule};