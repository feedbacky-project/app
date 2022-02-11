import styled from "@emotion/styled";
import axios from "axios";
import TextInputActionModal from "components/commons/modal/TextInputActionModal";
import {AppContext} from "context";
import React, {useContext, useState} from 'react';
import {ModalDialog} from "react-bootstrap";
import {UiClassicButton} from "ui/button";
import {UiImage} from "ui/image";
import {UiModal} from "ui/modal";
import {popupNotification} from "utils/basic-utils";

//todo replace me
const CascadingModal = styled(ModalDialog)`
  height: calc(100vh - 3.5rem);
  transform: none;
  transition: transform .3s ease-out;
  margin: 1.76rem auto;
  display: flex;
  align-items: center;
  position: relative;
  width: auto;
  pointer-events: none;
  &::before {
    height: calc(100vh - 3.5rem);
    display: block;
    content: "";
  }
  
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

const LoginHeader = styled(UiImage)`
  background-color: var(--secondary);
  
  .dark & {
    background-color: var(--tertiary);
  }
`;

const LoginModal = ({isOpen, onHide, boardName, image, redirectUrl}) => {
    const {serviceData, getTheme} = useContext(AppContext);
    const [mailModalOpen, setMailModalOpen] = useState(false);
    const onMailLogin = (email) => {
        popupNotification("Sending Log-in Link...", getTheme());
        axios.get("/service/mailRequest?email=" + email).then(res => {
            if (res.status === 200) {
                popupNotification("Check mailbox for Log-in Link.", getTheme());
            }
            setMailModalOpen(false);
        });
    };
    const renderMailLogin = () => {
        if(!serviceData.mailLoginEnabled) {
            return <React.Fragment/>
        }
        return <React.Fragment>
            <TextInputActionModal size={"sm"} id={"emailInput"} isOpen={mailModalOpen} onHide={() => setMailModalOpen(false)} actionButtonName={"Send Link"}
                                  actionDescription={"Type your email to receive log-in link."} onAction={email => {
                onMailLogin(email);
                return Promise.resolve();
            }}/>
            <UiClassicButton label={"Mail Log-in"} className={"mx-1"} style={{color: "#fff", backgroundColor: "#74c23d"}} onClick={() => setMailModalOpen(true)}>
                <img alt={"Mail"} src={"https://static.plajer.xyz/svg/login-mail.svg"} width={16} height={16}/>
            </UiClassicButton>
        </React.Fragment>
    };

    return <React.Fragment>

        <UiModal size={"sm"} dialogAs={CascadingModal} id={"loginModal"} isOpen={isOpen} onHide={onHide}
                 header={<LoginHeader src={image} alt={"Avatar"} roundedCircle thumbnail/>}>
            <div className={"text-center pt-2 mt-3 text-black-75"}>
                <div className={"mb-2"}>Sign in to <span style={{color: getTheme()}}>{boardName}</span> with</div>
                {renderMailLogin()}
                {serviceData.loginProviders.map((data, i) => {
                    let provider = data;
                    return <a key={i} href={provider.oauthLink + redirectUrl} tabIndex={-1}>
                        <UiClassicButton label={provider.name + " Log-in"} className={"mx-1"} style={{color: "#fff", backgroundColor: provider.color}}>
                            <img alt={provider.name} src={provider.icon} width={16} height={16}/>
                        </UiClassicButton>
                    </a>
                })}
            </div>
        </UiModal>
    </React.Fragment>
};

export default LoginModal;