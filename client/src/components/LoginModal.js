import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {ModalDialog} from "react-bootstrap";
import {UiClassicButton} from "ui/button";
import {UiImage} from "ui/image";
import {UiModal} from "ui/modal";

//todo replace me
const CascadingModal = styled(ModalDialog)`
  height: calc(100vh - 3.5rem);
  transform: none;
  transition: transform .3s ease-out;
  margin: 1.76rem auto;
  display: flex;
  align-items: center;
  position: relative;
  width: auto;
  pointer-events: none;
  &::before {
    height: calc(100vh - 3.5rem);
    display: block;
    content: "";
  }
  
  .modal-header {
    margin: -6rem 0 -1rem;
    box-shadow: none;
    
    img {
      width: 130px;
      margin-right: auto;
      margin-left: auto;
      box-shadow: var(--box-shadow);
    }
  }
`;

const LoginHeader = styled(UiImage)`
  background-color: var(--secondary);
  
  .dark & {
    background-color: var(--dark-tertiary);
  }
`;

const LoginModal = ({isOpen, onHide, boardName, image, redirectUrl}) => {
    const {serviceData, getTheme} = useContext(AppContext);
    return <UiModal size={"sm"} dialogAs={CascadingModal} id={"loginModal"} isOpen={isOpen} onHide={onHide}
                    header={<LoginHeader src={image} alt={"Avatar"} roundedCircle thumbnail/>}>
        <div className={"text-center pt-2 mt-3 text-black-75"}>
            <div className={"mb-2"}>Sign in to <span style={{color: getTheme()}}>{boardName}</span> with</div>
            {serviceData.loginProviders.map((data, i) => {
                let provider = data;
                return <a key={i} href={provider.oauthLink + redirectUrl} tabIndex={-1}>
                    <UiClassicButton label={provider.name + " Log-in"} className={"mx-1"} style={{color: "#fff", backgroundColor: provider.color}}>
                        <img alt={provider.name} src={provider.icon} width={16} height={16}/>
                    </UiClassicButton>
                </a>
            })}
        </div>
    </UiModal>
};

export default LoginModal;