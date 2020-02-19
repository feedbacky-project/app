import React from 'react';
import {FaDiscord, FaGithub, FaGoogle} from "react-icons/fa";
import {Modal} from "react-bootstrap";

//todo configurable
const DISCORD_OAUTH_LOGIN = "https://discordapp.com/api/oauth2/authorize?client_id=513351325376053270&redirect_uri=https%3A%2F%2Fapp.feedbacky.net%2Fauth%2Fdiscord&response_type=code&scope=identify%20email&state=";
const GOOGLE_OAUTH_LOGIN = "https://accounts.google.com/o/oauth2/v2/auth?client_id=511901757370-a2hefie6cf8sqanmfina2o3pnlpdgtf8.apps.googleusercontent.com&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&redirect_uri=https%3A%2F%2Fapp.feedbacky.net%2Fauth%2Fgoogle&state=";
const GITHUB_OAUTH_LOGIN = "https://github.com/login/oauth/authorize?client_id=86ffcdc324b98f0c6a75&redirect_uri=https%3A%2F%2Fapp.feedbacky.net%2Fauth%2Fgithub&scope=read%3Auser%20user%3Aemail&state=";

const LoginModal = (props) => {
    return <Modal size="sm" centered id="loginModal"
                  show={props.open} onHide={props.onLoginModalClose} dialogClassName="cascading-modal modal-avatar">
        <Modal.Header className="w-100">
            <img src={props.image} alt="avatar"
                 className="rounded-circle img-responsive img-thumbnail"/>
        </Modal.Header>
        <Modal.Body className="text-center pt-1 text-black-75">
            Sign in to {props.boardName} with<br/>
            <a href={DISCORD_OAUTH_LOGIN + props.redirectUrl}>
                <button type="button" className="btn btn-social btn-discord"><FaDiscord className="move-top-1px"/></button>
            </a>
            <a href={GOOGLE_OAUTH_LOGIN + props.redirectUrl}>
                <button type="button" className="btn btn-social btn-google"><FaGoogle className="move-top-1px"/></button>
            </a>
            <a href={GITHUB_OAUTH_LOGIN + props.redirectUrl}>
                <button type="button" className="btn btn-social btn-git"><FaGithub className="move-top-1px"/></button>
            </a>
        </Modal.Body>
    </Modal>
};

export default LoginModal;