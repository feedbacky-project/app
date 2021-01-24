import React, {useContext} from 'react';
import {Modal} from "react-bootstrap";
import AppContext from "context/app-context";

const LoginModal = ({open, onLoginModalClose, boardName, image, redirectUrl}) => {
    const context = useContext(AppContext);
    return <Modal size="sm" centered id="loginModal" show={open} onHide={onLoginModalClose} dialogClassName="cascading-modal modal-avatar">
        <Modal.Header className="w-100">
            <img src={image} alt="avatar" className="rounded-circle img-thumbnail"/>
        </Modal.Header>
        <Modal.Body className="text-center pt-2 pb-3 my-3 text-black-75">
            <div className="mb-2">Sign in to {boardName} with</div>
            {context.serviceData.loginProviders.map((data, i) => {
                let provider = data.providerData;
                return <a key={i} href={provider.oauthLink + redirectUrl}>
                    <button type="button" className="btn btn-social move-top-1px mx-1" style={{color: "#fff", backgroundColor: provider.color}}><img alt={provider.name} src={provider.icon} width={16} height={16}/></button>
                </a>
            })}
        </Modal.Body>
    </Modal>
};

export default LoginModal;