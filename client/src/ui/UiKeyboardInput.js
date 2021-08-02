import styled from "@emotion/styled";
import React from "react";

const KeyboardInput = styled.kbd`
  padding: .2rem .4rem;
  font-size: 87.5%;
  color: white;
  background-color: hsl(214, 6%, 23%);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  .dark & {
    background-color: hsl(213, 7%, 24%);
  }
`;

const UiKeyboardInput = (props) => {
    return <KeyboardInput {...props}>{props.children}</KeyboardInput>;
};

export {UiKeyboardInput};
