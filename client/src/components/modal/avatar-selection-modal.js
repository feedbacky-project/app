import React, {useContext} from 'react';
import AppContext from "../../context/app-context";
import md5 from "md5";
import PropTypes from "prop-types";
import {Col, Row} from "react-bootstrap";
import {prettifyEnum} from "../util/utils";
import PageModal from "./page-modal";

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
    return <PageModal id="avatarSelection" isOpen={props.open} onHide={props.onAvatarModalClose} title="Choose Avatar" applyButton={<React.Fragment/>}>
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
    </PageModal>
};

AvatarSelectionModal.propTypes = {
    onAvatarModalClose: PropTypes.func,
    open: PropTypes.bool,
    onAvatarChoose: PropTypes.func,
    connectedAccounts: PropTypes.array,
};

export default AvatarSelectionModal;