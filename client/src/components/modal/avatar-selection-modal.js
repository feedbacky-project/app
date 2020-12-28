import React, {useContext} from 'react';
import AppContext from "context/app-context";
import md5 from "md5";
import PropTypes from "prop-types";
import {Col, Row} from "react-bootstrap";
import {getDefaultAvatar, prettifyEnum} from "components/util/utils";
import PageModal from "components/modal/page-modal";

const AvatarSelectionModal = (props) => {
    const context = useContext(AppContext);
    if(props.connectedAccounts.error) {
        return <React.Fragment/>
    }
    const renderConnectedAccounts = () => {
        return props.connectedAccounts.data.map((conn, i) => {
            let data = JSON.parse(conn.data);
            if (data.AVATAR === undefined) {
                return <React.Fragment key={i}/>
            }
            return <Col key={i} xs={5} sm={3} className="cursor-click text-center" onClick={() => props.onAvatarChoose(data.AVATAR)}>
                <img src={data.AVATAR} alt={prettifyEnum(conn.accountType) + " Avatar"} width={100} className="img-fluid img-thumbnail rounded-circle hoverable-option"/>
                <div className="mt-1">{prettifyEnum(conn.accountType)}</div>
            </Col>
        });
    };
    return <PageModal id="avatarSelection" isOpen={props.open} onHide={props.onAvatarModalClose} title="Choose Avatar" applyButton={<React.Fragment/>}>
        <Row className="mt-3 justify-content-center">
            <Col xs={5} sm={3} className="cursor-click text-center" onClick={() => props.onAvatarChoose(getDefaultAvatar(context.user.data.username))}>
                <img src={getDefaultAvatar(context.user.data.username)} alt="Default Avatar" width={100} className="img-fluid img-thumbnail rounded-circle hoverable-option"/>
                <div className="mt-1">Default</div>
            </Col>
            <Col xs={5} sm={3} className="cursor-click text-center"
                 onClick={() => props.onAvatarChoose("https://www.gravatar.com/avatar/" + md5(context.user.data.email) + ".jpg?s=100")}>
                <img src={"https://www.gravatar.com/avatar/" + md5(context.user.data.email) + ".jpg?s=100"}
                     alt="Gravatar Avatar" width={100} className="img-fluid img-thumbnail rounded-circle hoverable-option"/>
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
    connectedAccounts: PropTypes.object,
};

export default AvatarSelectionModal;