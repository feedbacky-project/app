import React, {useContext, useState} from 'react';
import AppContext from "context/app-context";
import {toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import axios from "axios";
import ProfileSidebar from "components/sidebar/profile-sidebar";
import {Col, Form} from "react-bootstrap";
import ViewBox from "components/viewbox/view-box";
import Button from "react-bootstrap/Button";

const NotificationsSubview = (props) => {
    const context = useContext(AppContext);
    const [moderatorsCommentsNotify, setModeratorsCommentsNotify] = useState(context.user.loggedIn ? context.user.data.mailPreferences.notifyFromModeratorsComments : false);
    const [tagsChangeNotify, setTagsChangeNotify] = useState(context.user.loggedIn ? context.user.data.mailPreferences.notifyFromTagsChange : false);
    const [statusChangeNotify, setStatusChangeNotify] = useState(context.user.loggedIn ? context.user.data.mailPreferences.notifyFromStatusChange : false);
    const onChangesSave = () => {
        let toastId = toastAwait("Saving changes...");
        axios.patch("/users/@me/mailPreferences", {
            notifyFromModeratorsComments: moderatorsCommentsNotify,
            notifyFromTagsChange: tagsChangeNotify,
            notifyFromStatusChange: statusChangeNotify
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            context.user.data.mailPreferences.notifyFromModeratorsComments = moderatorsCommentsNotify;
            context.user.data.mailPreferences.notifyFromTagsChange = tagsChangeNotify;
            context.user.data.mailPreferences.notifyFromStatusChange = statusChangeNotify;
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
    if (!context.user.loggedIn) {
        return <React.Fragment>
            <ProfileSidebar currentNode="notifications" reRouteTo={props.reRouteTo}/>
            <Col xs={12} md={9}>
                <ViewBox theme={context.getTheme()} title="Mail Notifications" description="Configure your mail notifications here.">
                    <Col className="text-center">Please log in to see contents of this page.</Col>
                </ViewBox>
            </Col>
        </React.Fragment>
    }
    const conditionalButton = (conditionEnabled, funcEnable, funcDisable) => {
        if (conditionEnabled) {
            return <Button variant="danger" className="m-0 mt-sm-0 mt-2" onClick={funcDisable}>Disable</Button>
        }
        return <Button variant="success" className="m-0 mt-sm-0 mt-2" onClick={funcEnable}>Enable</Button>
    };
    const renderContent = () => {
        return <React.Fragment>
            <Form.Group className="row col-12 m-0 p-0 px-4 my-2">
                <div className="col-sm-9 col-12 p-0">
                    <h4 className="mb-1 h4-responsive">Moderator Comments</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Notify me via email when moderator comments idea I'm subscribed to.
                    </span>
                </div>
                <div className="col-sm-3 col-6 p-0 text-sm-right text-left my-auto">
                    {conditionalButton(moderatorsCommentsNotify, () => setModeratorsCommentsNotify(true), () => setModeratorsCommentsNotify(false))}
                </div>
            </Form.Group>
            <Form.Group className="row col-12 m-0 p-0 px-4 my-2">
                <div className="col-sm-9 col-12 p-0">
                    <h4 className="mb-1 h4-responsive">Tags Change</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Notify me via email when idea I'm subscribed to tags get changed.
                    </span>
                </div>
                <div className="col-sm-3 col-6 p-0 text-sm-right text-left my-auto">
                    {conditionalButton(tagsChangeNotify, () => setTagsChangeNotify(true), () => setTagsChangeNotify(false))}
                </div>
            </Form.Group>
            <Form.Group className="row col-12 m-0 p-0 px-4 my-2">
                <div className="col-sm-9 col-12 p-0">
                    <h4 className="mb-1 h4-responsive">Status Change</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Notify me via email when idea I'm subscribed to gets closed or opened.
                    </span>
                </div>
                <div className="col-sm-3 col-6 p-0 text-sm-right text-left my-auto">
                    {conditionalButton(statusChangeNotify, () => setStatusChangeNotify(true), () => setStatusChangeNotify(false))}
                </div>
            </Form.Group>
            <Col xs={12}>
                <Button className="m-0 mt-3 ml-3 text-white float-right" variant="success" onClick={onChangesSave}>
                    Save Settings
                </Button>
            </Col>
        </React.Fragment>
    };
    return <React.Fragment>
        <ProfileSidebar currentNode="notifications" reRouteTo={props.reRouteTo}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="Mail Notifications" description="Configure your mail notifications here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default NotificationsSubview;