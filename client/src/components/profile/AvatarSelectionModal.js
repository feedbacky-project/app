import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import md5 from "md5";
import PropTypes from "prop-types";
import React, {useContext} from 'react';
import {UiCol, UiRow} from "ui/grid";
import {UiImage} from "ui/image";
import {UiDismissibleModal} from "ui/modal";
import {getDefaultAvatar} from "utils/basic-utils";

const SelectableAvatar = styled(UiImage)`
  transition: var(--hover-transition);
  max-width: 100%;
  height: auto;
  cursor: pointer;
  &:hover {
    transform: var(--hover-transform-scale-lg);
  }
  .dark & {
    background-color: var(--dark-tertiary);
  }
`;

const AvatarSelectionModal = ({isOpen, onHide, connectedAccounts, onAvatarChoose}) => {
    const {user} = useContext(AppContext);
    if (connectedAccounts.error) {
        return <React.Fragment/>
    }
    return <UiDismissibleModal id={"avatarSelection"} isOpen={isOpen} onHide={onHide} title={"Choose Avatar"} applyButton={<React.Fragment/>}>
        <UiRow centered className={"mt-3"}>
            <UiCol xs={5} sm={3} className={"text-center"} onClick={() => onAvatarChoose(getDefaultAvatar(user.data.username))}>
                <SelectableAvatar src={getDefaultAvatar(user.data.username)} roundedCircle thumbnail alt={"Default Avatar"} width={100} height={100}/>
                <div className={"mt-1"}>Default</div>
            </UiCol>
            <UiCol xs={5} sm={3} className={"text-center"} onClick={() => onAvatarChoose("https://www.gravatar.com/avatar/" + md5(user.data.email) + ".jpg?s=100")}>
                <SelectableAvatar src={"https://www.gravatar.com/avatar/" + md5(user.data.email) + ".jpg?s=100"} alt={"Gravatar Avatar"} roundedCircle thumbnail width={100} height={100}/>
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