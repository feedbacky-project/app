import React, {useContext} from 'react';
import {Modal} from "react-bootstrap";
import AppContext from "../../context/app-context";

const LoginModal = (props) => {
    const context = useContext(AppContext);
    return <Modal size="sm" centered id="loginModal"
                  show={props.open} onHide={props.onLoginModalClose} dialogClassName="cascading-modal modal-avatar">
        <Modal.Header className="w-100">
            <img src={props.image} alt="avatar" className="rounded-circle img-responsive img-thumbnail"/>
        </Modal.Header>
        <Modal.Body className="text-center pt-1 text-black-75">
            Sign in to {props.boardName} with<br/>
            {context.serviceData.loginProviders.map((data, _i) => {
                let provider = data.providerData;
                return <a key={_i} href={provider.oauthLink + props.redirectUrl}>
                    <button type="button" className="btn btn-social move-top-1px" style={{color: "#fff", backgroundColor: provider.color}}><img alt={provider.name} src={provider.icon} width={16} height={16}/></button>
                </a>
            })}
        </Modal.Body>
    </Modal>
};

export default LoginModal;