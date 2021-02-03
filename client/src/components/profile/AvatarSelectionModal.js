import AppContext from "context/AppContext";
import md5 from "md5";
import PropTypes from "prop-types";
import React, {useContext} from 'react';
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {getDefaultAvatar} from "utils/basic-utils";

const AvatarSelectionModal = ({isOpen, onHide, connectedAccounts, onAvatarChoose}) => {
    const {user} = useContext(AppContext);
    if (connectedAccounts.error) {
        return <React.Fragment/>
    }
    return <UiDismissibleModal id={"avatarSelection"} isOpen={isOpen} onHide={onHide} title={"Choose Avatar"} applyButton={<React.Fragment/>}>
        <UiRow centered className={"mt-3"}>
            <UiCol xs={5} sm={3} className={"cursor-click text-center"} onClick={() => onAvatarChoose(getDefaultAvatar(user.data.username))}>
                <img src={getDefaultAvatar(user.data.username)} alt={"Default Avatar"} width={100} height={100} className={"img-thumbnail rounded-circle hoverable-option"}/>
                <div className={"mt-1"}>Default</div>
            </UiCol>
            <UiCol xs={5} sm={3} className={"cursor-click text-center"}
                   onClick={() => onAvatarChoose("https://www.gravatar.com/avatar/" + md5(user.data.email) + ".jpg?s=100")}>
                <img src={"https://www.gravatar.com/avatar/" + md5(user.data.email) + ".jpg?s=100"}
                     alt={"Gravatar Avatar"} width={100} height={100} className={"img-thumbnail rounded-circle hoverable-option"}/>
                <div className={"mt-1"}>Gravatar</div>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};

AvatarSelectionModal.propTypes = {
    onHide: PropTypes.func,
    isOpen: PropTypes.bool,
    onAvatarChoose: PropTypes.func,
    connectedAccounts: PropTypes.object,
};

export default AvatarSelectionModal;