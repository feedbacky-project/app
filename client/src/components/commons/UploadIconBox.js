import styled from "@emotion/styled";
import React, {useContext} from "react";
import {FaUpload} from "react-icons/fa";
import {UiThemeContext} from "ui";

const UploadButton = styled.div`
  background-color: ${props => props.theme};
  cursor: pointer;
  width: 90px;
  height: 90px;
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 50%;
  padding: 1rem;
  transition: var(--hover-transition);
  text-shadow: 0 0 4px black;
  text-align: center;
  color: white;
  
  &:hover {
    transform: var(--hover-transform-scale-lg);
  }
`;

const UploadIcon = styled(FaUpload)`
  width: 1.8em;
  height: 1.8em;
  margin-bottom: .25em;
`

const UploadIconBox = ({text = "Upload"}) => {
    const {getTheme} = useContext(UiThemeContext);
    return <UploadButton theme={getTheme().setAlpha(.8).toString()}>
        <UploadIcon/>
        <div>{text}</div>
    </UploadButton>
};

export default UploadIconBox;