import ProfileSidebar from "components/sidebar/profile-sidebar";
import {Col, Form, Row} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";
import {formatRemainingCharacters, toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import AppContext from "context/app-context";
import Button from "react-bootstrap/Button";
import axios from "axios";
import AvatarSelectionModal from "components/modal/avatar-selection-modal";
import Swal from "sweetalert2";
import swalReact from "sweetalert2-react-content";
import {useHistory} from "react-router-dom";
import ViewBox from "components/viewbox/view-box";
import ComponentLoader from "components/app/component-loader";
import ExecutableButton from "components/app/executable-button";

const SettingsSubview = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const history = useHistory();
    const swalGenerator = swalReact(Swal);
    const [username, setUsername] = useState(context.user.data.username);
    const [avatar, setAvatar] = useState(context.user.data.avatar);
    const [connectedAccounts, setConnectedAccounts] = useState({data: [], loaded: false, error: false});
    const [modalOpened, setModalOpened] = useState(false);
    const onChangesSave = () => {
        let toastId = toastAwait("Saving changes...");
        return axios.patch("/users/@me", {
            username, avatar
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            context.user.data.username = username;
            context.user.data.avatar = avatar;
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
        return swalGenerator.fire({
            title: "Irreversible action!",
            html: "Hold on, <strong>this is one way road</strong>.<br/>All your content <strong>will be anonymized</strong> and you won't be able to log into this account anymore." +
                "<br/><br/>Type your email (" + context.user.data.email + ") to confirm deactivation and continue.",
            icon: "error",
            showCancelButton: true,
            animation: false,
            reverseButtons: true,
            focusCancel: true,
            cancelButtonColor: "#00c851",
            confirmButtonColor: "#d33",
            confirmButtonText: "Deactivate Now",
            input: "text",
            preConfirm: (email) => {
                if (context.user.data.email === email) {
                    return true;
                }
                Swal.showValidationMessage("Type your email properly.");
                return false;
            }
        }).then(willClose => {
            if (!willClose.value) {
                return;
            }
            let toastId = toastAwait("Deactivating account, you're getting logged out...");
            axios.delete("/users/@me").then(res => {
                if (res.status !== 200 && res.status !== 204) {
                    toastError();
                    return;
                }
                context.user.onLogOut();
                history.push("/me/explore");
                toastSuccess("Account permanently deactivated.", toastId);
            }).catch(err => toastError(err.response.data.errors[0]));
        });
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
    if (!context.user.loggedIn) {
        return <React.Fragment>
            <ProfileSidebar currentNode="settings" reRouteTo={reRouteTo}/>
            <Col xs={12} md={9}>
                <ViewBox theme={context.getTheme(false)} title="User Settings" description="Edit your account here.">
                    <Col className="text-center py-4">Please log in to see contents of this page.</Col>
                </ViewBox>
            </Col>
        </React.Fragment>
    }
    const renderContent = () => {
        return <React.Fragment>
            <ComponentLoader loaded={connectedAccounts.loaded} component={
                <AvatarSelectionModal open={modalOpened} onAvatarModalClose={() => setModalOpened(false)}
                                      connectedAccounts={connectedAccounts} onAvatarChoose={av => {
                    setModalOpened(false);
                    setAvatar(av);
                }}/>
            } loader={<React.Fragment/>}/>
            <Col xs={12} lg={6} className="order-lg-1 order-2">
                <Form.Label className="mr-1 mt-lg-0 mt-2 text-black-60">Username</Form.Label>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="4" maxLength="20" rows="1" required
                              type="text" className="bg-light"
                              placeholder="Name of your account." defaultValue={username} id="usernameTextarea"
                              onKeyUp={e => {
                                  setUsername(e.target.value);
                                  formatRemainingCharacters("remainingUsername", "usernameTextarea", 20);
                              }}/>
                <Form.Text className="text-right text-black-60" id="remainingUsername">
                    {20 - username.length} Remaining
                </Form.Text>
            </Col>
            <Col xs={12} lg={6} className="order-lg-2 order-1">
                <Form.Label className="mr-1 text-black-60">Avatar</Form.Label>
                <br/>
                <img alt="avatar" src={avatar} className="img-fluid rounded-circle" width={100}/>
                <ComponentLoader loaded={connectedAccounts.loaded}
                                 component={<Button variant="success" className="align-top mx-3 my-0" onClick={() => setModalOpened(true)}>Change</Button>}
                                 loader={<Button variant="success" disabled className="align-top mx-3 my-0">Loading</Button>}
                />
            </Col>
            <Col xs={12} lg={6} className="order-3">
                <Form.Label className="mr-1 mt-2 text-black-60">Email</Form.Label>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="4" maxLength="20" rows="1" required
                              disabled
                              value={context.user.data.email} id="emailTextarea"/>
                <Form.Text className="text-right text-black-60" id="remainingUsername">
                    Cannot Change
                </Form.Text>
            </Col>
            <Col xs={12} className="order-4">
                <ExecutableButton className="m-0 mt-3 ml-3 float-right" variant="success" onClick={onChangesSave}>
                    Save Settings
                </ExecutableButton>
            </Col>
        </React.Fragment>
    };
    return <React.Fragment>
        <ProfileSidebar currentNode="settings" reRouteTo={reRouteTo}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme(false)} title="User Settings" description="Edit your account here.">
                {renderContent()}
            </ViewBox>
            <Col xs={12} className="mb-3 view-box-bg mt-2 py-2 danger-shadow">
                <Row noGutters className="col-12 p-3">
                    <Col sm={9} xs={12}>
                        <h4 className="mb-1 text-danger">Deactivate Account</h4>
                        <span className="text-black-50" style={{fontSize: ".9em"}}>
                            Personal information will be <strong>permanently removed</strong> but all your content will be anonymized. <strong>Irreversible action.</strong>
                        </span>
                    </Col>
                    <Col sm={3} xs={6} className="text-sm-right text-left my-auto">
                        <ExecutableButton onClick={onAccountDeactivation} variant="danger">
                            Deactivate
                        </ExecutableButton>
                    </Col>
                </Row>
            </Col>
        </Col>
    </React.Fragment>
};

export default SettingsSubview;