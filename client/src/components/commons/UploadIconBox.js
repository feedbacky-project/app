import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from "react";
import {FaUpload} from "react-icons/all";

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

const UploadIconBox = ({text = "Upload"}) => {
    const {getTheme} = useContext(AppContext);
    return <UploadButton theme={getTheme().setAlpha(.8).toString()}>
        <FaUpload className={"mb-1"} style={{width: "1.8em", height: "1.8em"}}/>
        <div>{text}</div>
    </UploadButton>
};

export default UploadIconBox;