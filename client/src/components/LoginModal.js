import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {Modal, ModalDialog} from "react-bootstrap";
import UiImage from "ui/image/UiImage";

const CascadingModal = styled(ModalDialog)`
  margin-top: 6rem;
  
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

const LoginModal = ({isOpen, onHide, boardName, image, redirectUrl}) => {
    const {serviceData, getTheme} = useContext(AppContext);
    return <Modal size={"sm"} dialogAs={CascadingModal} centered id={"loginModal"} show={isOpen} onHide={onHide}>
        <Modal.Header>
            <UiImage src={image} alt={"Avatar"} roundedCircle className={"img-thumbnail"}/>
        </Modal.Header>
        <Modal.Body className={"text-center pt-2 pb-3 my-3 text-black-75"}>
            <div className={"mb-2"}>Sign in to <span style={{color: getTheme()}}>{boardName}</span> with</div>
            {serviceData.loginProviders.map((data, i) => {
                let provider = data.providerData;
                return <a key={i} href={provider.oauthLink + redirectUrl}>
                    <button type={"button"} className={"btn btn-social move-top-1px mx-1"} style={{color: "#fff", backgroundColor: provider.color}}><img alt={provider.name} src={provider.icon} width={16} height={16}/></button>
                </a>
            })}
        </Modal.Body>
    </Modal>
};

export default LoginModal;