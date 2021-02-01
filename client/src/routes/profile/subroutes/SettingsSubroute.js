import axios from "axios";
import ConfirmationActionModal from "components/commons/ConfirmationActionModal";
import ComponentLoader from "components/ComponentLoader";
import AvatarSelectionModal from "components/profile/AvatarSelectionModal";
import AppContext from "context/AppContext";
import PageNodesContext from "context/PageNodesContext";
import React, {useContext, useEffect, useState} from "react";
import {Form} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import tinycolor from "tinycolor2";
import {UiLoadingSpinner} from "ui";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiCountableFormControl, UiFormControl} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {toastAwait, toastError, toastSuccess, toastWarning} from "utils/basic-utils";

const SettingsSubroute = () => {
    const {user, getTheme} = useContext(AppContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const history = useHistory();
    const [username, setUsername] = useState(user.data.username);
    const [avatar, setAvatar] = useState(user.data.avatar);
    const [connectedAccounts, setConnectedAccounts] = useState({data: [], loaded: false, error: false});
    const [modal, setModal] = useState({open: false, type: ""});
    useEffect(() => setCurrentNode("settings"), [setCurrentNode]);
    const onChangesSave = () => {
        if (username.length < 3) {
            toastWarning("Username length should be longer than 3 characters.");
            return Promise.resolve();
        }
        let toastId = toastAwait("Saving changes...");
        return axios.patch("/users/@me", {
            username, avatar
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            user.data.username = username;
            user.data.avatar = avatar;
            toastSuccess("Settings successfully updated.", toastId);
        }).catch(err => {
            if (err.response === undefined) {
                return;
            }
            err.response.data.errors.forEach(data => {
                toastWarning(data);
            });
        });
    };
    const onAccountDeactivation = () => {
        let toastId = toastAwait("Deactivating account, you're getting logged out...");
        return axios.delete("/users/@me").then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            user.onLogOut();
            history.push("/me");
            toastSuccess("Account permanently deactivated.", toastId);
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    useEffect(() => {
        axios.get("/users/@me/connectedAccounts").then(res => {
            if (res.status !== 200) {
                return;
            }
            setConnectedAccounts({...connectedAccounts, data: res.data, loaded: true});
        }).catch(() => setConnectedAccounts({...connectedAccounts, loaded: true, error: true}));
        // eslint-disable-next-line
    }, []);
    if (!user.loggedIn) {
        return <UiCol xs={12} md={9}>
            <UiViewBox theme={getTheme(false)} title={"User Settings"} description={"Edit your account here."}>
                <UiCol className={"text-center py-4"}>Please log in to see contents of this page.</UiCol>
            </UiViewBox>
        </UiCol>
    }
    const renderContent = () => {
        return <React.Fragment>
            <ComponentLoader loaded={connectedAccounts.loaded} component={
                <AvatarSelectionModal isOpen={modal.open && modal.type === "avatar"} onHide={() => setModal({...modal, open: false})}
                                      connectedAccounts={connectedAccounts} onAvatarChoose={av => {
                    setModal({...modal, open: false});
                    setAvatar(av);
                }}/>
            } loader={<React.Fragment/>}/>
            <ConfirmationActionModal id={"accDel"} isOpen={modal.open && modal.type === "anonymize"} onHide={() => setModal({...modal, open: false})} actionButtonName={"Deactivate"} onAction={onAccountDeactivation}
                                     confirmText={user.data.email} confirmFailMessage={"Type your email properly."}
                                     actionDescription={<div>
                                         <strong>This is one-way road</strong> your account will be <strong>fully anonymized</strong> but your content on the page will be kept.
                                         <div>You won't be able to log-in to this account anymore.</div>
                                         <div>Type <kbd>{user.data.email}</kbd> to continue.</div>
                                     </div>}/>
            <UiCol xs={{span: 12, order: 2}} lg={{span: 6, order: 1}}>
                <Form.Label className={"mr-1 mt-lg-0 mt-2 text-black-60"}>Username</Form.Label>
                <UiCountableFormControl id={"usernameTextarea"} className={"bg-light"} defaultValue={user.data.username} minLength={4} maxLength={20} placeholder={"Name of your account."}
                                        onChange={e => setUsername(e.target.value.substring(0, 20))}/>
            </UiCol>
            <UiCol xs={{span: 12, order: 1}} lg={{span: 6, order: 2}}>
                <Form.Label className={"mr-1 text-black-60"}>Avatar</Form.Label>
                <br/>
                <img alt={"avatar"} src={avatar} className={"rounded-circle"} width={100} height={100}/>
                <ComponentLoader loaded={connectedAccounts.loaded}
                                 component={<UiButton color={tinycolor("#00c851")} className={"align-top mx-3 my-0"} onClick={() => setModal({open: true, type: "avatar"})}>Change</UiButton>}
                                 loader={<UiButton color={tinycolor("#00c851")} disabled className={"align-top mx-3 my-0"}>
                                     <UiLoadingSpinner color={tinycolor("#f2f2f2")} className={"mr-1"} size={"sm"}/> Loading
                                 </UiButton>}
                />
            </UiCol>
            <UiCol xs={{span: 12, order: 3}} lg={6}>
                <Form.Label className={"mr-1 mt-2 text-black-60"}>Email</Form.Label>
                <UiFormControl rows={1} disabled value={user.data.email} id={"emailTextarea"}/>
                <Form.Text className={"text-right text-black-60"} id={"remainingUsername"}>
                    Cannot Change
                </Form.Text>
            </UiCol>
            <UiCol xs={{span: 12, order: 4}}>
                <UiLoadableButton color={tinycolor("#00c851")} className={"m-0 mt-3 ml-3 float-right"} onClick={onChangesSave}>
                    Save Settings
                </UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    return <UiCol xs={12} md={9}>
        <UiViewBox theme={getTheme(false)} title={"User Settings"} description={"Edit your account here."}>
            {renderContent()}
        </UiViewBox>
        <UiCol xs={12} className={"mb-3 view-box-bg mt-2 py-2 danger-shadow"}>
            <UiRow noGutters className={"p-3"}>
                <UiCol sm={9} xs={12}>
                    <h4 className={"mb-1 text-danger"}>Deactivate Account</h4>
                    <span className={"text-black-60"} style={{fontSize: ".9em"}}>
                            Personal information will be <strong>permanently removed</strong> but all your content will be anonymized. <strong>Irreversible action.</strong>
                        </span>
                </UiCol>
                <UiCol sm={3} xs={6} className={"text-sm-right text-left my-auto"}>
                    <UiLoadableButton color={tinycolor("#ff3547")} onClick={() => Promise.resolve(setModal({...modal, open: true, type: "anonymize"}))}>
                        Deactivate
                    </UiLoadableButton>
                </UiCol>
            </UiRow>
        </UiCol>
    </UiCol>
};

export default SettingsSubroute;