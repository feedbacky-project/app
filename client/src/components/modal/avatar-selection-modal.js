import React, {useContext} from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import AppContext from "../../context/app-context";
import md5 from "md5";
import PropTypes from "prop-types";
import {Col, Row} from "react-bootstrap";
import {prettifyEnum} from "../util/utils";

const AvatarSelectionModal = (props) => {
    const context = useContext(AppContext);
    const renderConnectedAccounts = () => {
        return props.connectedAccounts.map((conn, i) => {
            let data = JSON.parse(conn.data);
            if (data.AVATAR === undefined) {
                return <React.Fragment key={"connAcc" + i}/>
            }
            return <Col key={"connAcc" + i} xs={5} sm={3} className="cursor-click text-center" onClick={() => props.onAvatarChoose(data.AVATAR)}>
                <img src={data.AVATAR} alt={prettifyEnum(conn.accountType) + " Avatar"} width={100} className="img-fluid img-thumbnail"/>
                <div className="mt-1">{prettifyEnum(conn.accountType)}</div>
            </Col>
        });
    };
    return <Modal id="avatarSelectionModal" show={props.open} onHide={props.onAvatarModalClose}>
        <Modal.Header className="text-center pb-0" style={{display: "block", borderBottom: "none"}}>
            <Modal.Title><h5 className="modal-title">Choose Avatar</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-1">
            <Row className="mt-3 justify-content-center">
                <Col xs={5} sm={3} className="cursor-click text-center" onClick={() => props.onAvatarChoose(process.env.REACT_APP_DEFAULT_USER_AVATAR)}>
                    <img src={process.env.REACT_APP_DEFAULT_USER_AVATAR}
                         alt="Default Avatar" width={100} className="img-fluid img-thumbnail"/>
                    <div className="mt-1">Default</div>
                </Col>
                <Col xs={5} sm={3} className="cursor-click text-center"
                     onClick={() => props.onAvatarChoose("https://www.gravatar.com/avatar/" + md5(context.user.data.email) + ".jpg?s=100?d=" + process.env.REACT_APP_DEFAULT_USER_AVATAR)}>
                    <img src={"https://www.gravatar.com/avatar/" + md5(context.user.data.email) + ".jpg?s=100?d=" + process.env.REACT_APP_DEFAULT_USER_AVATAR}
                         alt="Gravatar Avatar" width={100} className="img-fluid img-thumbnail"/>
                    <div className="mt-1">Gravatar</div>
                </Col>
                {renderConnectedAccounts()}
            </Row>
        </Modal.Body>
        <Modal.Footer style={{borderTop: "none"}} className="pt-2">
            <Button variant="link" className="m-0 btn-smaller text-black-60" onClick={props.onAvatarModalClose}>
                Cancel
            </Button>
        </Modal.Footer>
    </Modal>
};

AvatarSelectionModal.propTypes = {
    onAvatarModalClose: PropTypes.func,
    open: PropTypes.bool,
    onAvatarChoose: PropTypes.func,
    connectedAccounts: PropTypes.array,
};

export default AvatarSelectionModal;