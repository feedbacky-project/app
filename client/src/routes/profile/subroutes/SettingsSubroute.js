import axios from "axios";
import ComponentLoader from "components/ComponentLoader";
import AccountDeleteModal from "components/profile/AccountDeleteModal";
import AvatarSelectionModal from "components/profile/AvatarSelectionModal";
import {AppContext, PageNodesContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import tinycolor from "tinycolor2";
import {UiLoadingSpinner, UiThemeContext} from "ui";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiCountableFormControl, UiFormControl, UiFormLabel, UiFormText} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {UiViewBoxDangerBackground} from "ui/viewbox/UiViewBox";
import {hideMail, popupError, popupNotification, popupWarning} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const SettingsSubroute = () => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const history = useHistory();
    const [username, setUsername] = useState(user.data.username);
    const [avatar, setAvatar] = useState(user.data.avatar);
    const [connectedAccounts, setConnectedAccounts] = useState({data: [], loaded: false, error: false});
    const [modal, setModal] = useState({open: false, type: ""});
    useEffect(() => setCurrentNode("settings"), [setCurrentNode]);
    useTitle("Profile | Settings");
    useEffect(() => {
        if (!user.loggedIn) {
            return;
        }
        axios.get("/users/@me/connectedAccounts").then(res => {
            if (res.status !== 200) {
                return;
            }
            setConnectedAccounts({...connectedAccounts, data: res.data, loaded: true});
        }).catch(() => setConnectedAccounts({...connectedAccounts, loaded: true, error: true}));
        // eslint-disable-next-line
    }, []);

    const onChangesSave = () => {
        if (username.length < 3) {
            popupWarning("Username length should be longer than 3 characters");
            return Promise.resolve();
        }
        return axios.patch("/users/@me", {
            username, avatar
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            user.data.username = username;
            user.data.avatar = avatar;
            popupNotification("Settings updated", getTheme());
        });
    };
    const onAccountDeactivation = () => {
        return axios.delete("/users/@me").then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            user.onLogOut();
            history.push("/me");
            popupNotification("Account deactivated and logged out", getTheme());
        });
    };
    if (!user.loggedIn) {
        return <UiCol xs={12} md={9}>
            <UiViewBox title={"User Settings"} description={"Edit your account here."}>
                <UiCol className={"text-center py-4"}>Please log in to see contents of this page.</UiCol>
            </UiViewBox>
        </UiCol>
    }
    const renderContent = () => {
        const component = <UiButton label={"Change"} color={tinycolor("#00c851")} className={"align-top mx-3 my-0"}
                                    onClick={() => setModal({open: true, type: "avatar"})}>Change</UiButton>;
        const loader = <UiButton label={"Loading..."} color={tinycolor("#00c851")} disabled className={"align-top mx-3 my-0"}>
            <UiLoadingSpinner className={"mr-1"} size={"sm"}/> Loading
        </UiButton>;
        return <React.Fragment>
            <ComponentLoader loaded={connectedAccounts.loaded} component={
                <AvatarSelectionModal isOpen={modal.open && modal.type === "avatar"} onHide={() => setModal({...modal, open: false})}
                                      connectedAccounts={connectedAccounts} onAvatarChoose={av => {
                    setModal({...modal, open: false});
                    setAvatar(av);
                }}/>
            } loader={<React.Fragment/>}/>
            <AccountDeleteModal isOpen={modal.open && modal.type === "anonymize"} user={user} onHide={() => setModal({...modal, open: false})} onAction={onAccountDeactivation}/>
            <UiCol xs={{span: 12, order: 2}} lg={{span: 6, order: 1}}>
                <UiFormLabel className={"mt-lg-0 mt-2"}>Username</UiFormLabel>
                <UiCountableFormControl id={"usernameTextarea"} defaultValue={user.data.username} minLength={4} maxLength={20} placeholder={"Name of your account."}
                                        onChange={e => setUsername(e.target.value.substring(0, 20))} label={"Type your username"}/>
            </UiCol>
            <UiCol xs={{span: 12, order: 1}} lg={{span: 6, order: 2}}>
                <UiFormLabel>Avatar</UiFormLabel>
                <br/>
                <img alt={"User Avatar"} src={avatar} className={"rounded-circle"} width={64} height={64}/>
                <ComponentLoader loaded={connectedAccounts.loaded} component={component} loader={loader}/>
            </UiCol>
            <UiCol xs={{span: 12, order: 3}} lg={6}>
                <UiFormLabel className={"mt-2"}>Email</UiFormLabel>
                <UiFormControl rows={1} disabled value={hideMail(user.data.email)} id={"emailTextarea"} label={"Email"}/>
                <UiFormText className={"text-right"} id={"remainingUsername"}>
                    Cannot Change
                </UiFormText>
            </UiCol>
            <UiCol xs={{span: 12, order: 4}}>
                <UiLoadableButton label={"Save"} color={tinycolor("#00c851")} className={"m-0 mt-3 float-right"} onClick={onChangesSave}>
                    Save Settings
                </UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    const onDeactivate = () => setModal({...modal, open: true, type: "anonymize"});
    return <UiCol xs={12} md={9}>
        <UiViewBox title={"User Settings"} description={"Edit your account here."}>
            {renderContent()}
        </UiViewBox>
        <UiViewBoxDangerBackground xs={12} className={"mb-3 mt-2 py-2"}>
            <UiRow noGutters className={"p-3"}>
                <UiCol sm={9} xs={12}>
                    <h4 className={"mb-1 text-red"}>Deactivate Account</h4>
                    <span className={"text-black-60"} style={{fontSize: ".9em"}}>
                        Personal information will be <strong>permanently removed</strong> but all your content will be anonymized. <strong>Irreversible action.</strong>
                    </span>
                </UiCol>
                <UiCol sm={3} xs={6} className={"text-sm-right text-left my-auto"}>
                    <UiButton dangerous label={"Deactivate Account"} className={"mt-sm-0 mt-2"} color={tinycolor("#ff3547")} onClick={onDeactivate}>
                        Deactivate
                    </UiButton>
                </UiCol>
            </UiRow>
        </UiViewBoxDangerBackground>
    </UiCol>
};

export default SettingsSubroute;