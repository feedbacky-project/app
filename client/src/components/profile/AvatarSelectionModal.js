import styled from "@emotion/styled";
import {AppContext} from "context";
import md5 from "md5";
import PropTypes from "prop-types";
import React, {useContext} from 'react';
import {UiThemeContext} from "ui";
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
    outline: 1px dashed ${props => props.theme} !important;
  }
  .dark & {
    background-color: var(--tertiary);
  }
`;

const AvatarSelectionModal = ({isOpen, onHide, connectedAccounts, onAvatarChoose}) => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);

    if (connectedAccounts.error) {
        return <React.Fragment/>
    }
    return <UiDismissibleModal id={"avatarSelection"} size={"sm"} isOpen={isOpen} onHide={onHide} title={"Choose Avatar"} applyButton={<React.Fragment/>}>
        <UiRow centered className={"mt-3"}>
            <UiCol xs={5} sm={3} className={"text-center px-0 mx-1"} onClick={() => onAvatarChoose(getDefaultAvatar(user.data.username))}>
                <SelectableAvatar theme={getTheme().setAlpha(.75).toString()} src={getDefaultAvatar(user.data.username)} roundedCircle thumbnail alt={"Default Avatar"} width={64} height={64}/>
                <div className={"mt-1"}>Default</div>
            </UiCol>
            <UiCol xs={5} sm={3} className={"text-center px-0 mx-1"} onClick={() => onAvatarChoose("https://www.gravatar.com/avatar/" + md5(user.data.email) + ".jpg?s=100")}>
                <SelectableAvatar theme={getTheme().setAlpha(.75).toString()} src={"https://www.gravatar.com/avatar/" + md5(user.data.email) + ".jpg?s=100"} alt={"Gravatar Avatar"} roundedCircle thumbnail width={64} height={64}/>
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