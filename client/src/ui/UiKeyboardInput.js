import React from "react";
import styled from "@emotion/styled";

const KeyboardInput = styled.kbd`
  padding: .2rem .4rem;
  font-size: 87.5%;
  color: white;
  background-color: hsl(210, 11%, 15%);
  border-radius: .35rem;
  box-shadow: inset 0 -.1rem 0 hsla(0, 0%, 0%, .25);
  .dark & {
    background-color: var(--dark-quaternary) !important;
  }
`;

const UiKeyboardInput = (props) => {
    return <KeyboardInput {...props}>{props.children}</KeyboardInput>;
};

export {UiKeyboardInput};
