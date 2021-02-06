import React from "react";
import styled from "@emotion/styled";

const HorizontalRule = styled.hr`
  border-top: 1px solid hsla(0, 0%, 0%, .1);
  .dark & {
    background-color: var(--dark-secondary);
  }
`;

const UiHorizontalRule = (props) => {
    return <HorizontalRule {...props}/>
};

export {UiHorizontalRule};