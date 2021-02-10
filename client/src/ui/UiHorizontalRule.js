import styled from "@emotion/styled";
import React from "react";

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