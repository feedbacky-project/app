import ProfileSidebar from "components/sidebar/profile-sidebar";
import {Col, Form} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";
import {formatRemainingCharacters, toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import AppContext from "context/app-context";
import Button from "react-bootstrap/Button";
import axios from "axios";
import AvatarSelectionModal from "components/modal/avatar-selection-modal";
import LoadingSpinner from "components/util/loading-spinner";
import Swal from "sweetalert2";
import swalReact from "sweetalert2-react-content";
import {useHistory} from "react-router-dom";
import ViewBox from "components/viewbox/view-box";

const SettingsSubview = (props) => {
    const context = useContext(AppContext);
    const history = useHistory();
    const swalGenerator = swalReact(Swal);
    const [username, setUsername] = useState(context.user.data.username);
    const [avatar, setAvatar] = useState(context.user.data.avatar);
    const [connectedAccounts, setConnectedAccounts] = useState(null);
    const [modalOpened, setModalOpened] = useState(false);
    const onChangesSave = () => {
        let toastId = toastAwait("Saving changes...");
        axios.patch("/users/@me", {
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
        swalGenerator.fire({
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
            setConnectedAccounts(res.data);
        });
    }, []);
    if (!context.user.loggedIn) {
        return <React.Fragment>
            <ProfileSidebar currentNode="settings" reRouteTo={props.reRouteTo}/>
            <Col xs={12} md={9}>
                <ViewBox theme={context.theme} title="User Settings" description="Edit your account here.">
                    Please log in to see contents of this page.
                </ViewBox>
            </Col>
        </React.Fragment>
    }
    const renderContent = () => {
        if (connectedAccounts === null) {
            return <LoadingSpinner/>
        }
        return <React.Fragment>
            <AvatarSelectionModal open={modalOpened} onAvatarModalClose={() => setModalOpened(false)}
                                  connectedAccounts={connectedAccounts} onAvatarChoose={av => {
                setModalOpened(false);
                setAvatar(av);
            }}/>
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
                <img alt="avatar" src={avatar} className="img-fluid rounded" width={100}/>
                <Button variant="success" className="align-top mx-3 my-0"
                        onClick={() => setModalOpened(true)}>Change</Button>
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
                <Button className="m-0 mt-3 ml-3 text-white float-right" variant="success" onClick={onChangesSave}>
                    Save Settings
                </Button>
            </Col>
        </React.Fragment>
    };
    return <React.Fragment>
        <ProfileSidebar currentNode="settings" reRouteTo={props.reRouteTo}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.theme} title="User Settings" description="Edit your account here.">
                {renderContent()}
            </ViewBox>
            <Col xs={12} className="mb-3 view-box-bg rounded mt-2 danger-shadow">
                <Form className="row py-3">
                    <Form.Group className="row col-12 m-0 p-0 px-4">
                        <div className="col-sm-9 col-12 p-0">
                            <h4 className="mb-1 h4-responsive text-danger">Deactivate Account</h4>
                            <span className="text-black-50" style={{fontSize: ".9em"}}>
                                Personal information will be <strong>permanently removed</strong> but all your content will be anonymized. <strong>Irreversible action.</strong>
                           </span>
                        </div>
                        <div className="col-sm-3 col-6 p-0 text-sm-right text-left my-auto">
                            <Button variant="danger" className="m-0 mt-sm-0 mt-2" onClick={() => onAccountDeactivation()}>Deactivate</Button>
                        </div>
                    </Form.Group>
                </Form>
            </Col>
        </Col>
    </React.Fragment>
};

export default SettingsSubview;