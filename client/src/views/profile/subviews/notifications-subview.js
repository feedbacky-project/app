import React, {useContext, useState} from 'react';
import AppContext from "context/app-context";
import {toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import axios from "axios";
import ProfileSidebar from "components/sidebar/profile-sidebar";
import {Col, Row} from "react-bootstrap";
import ViewBox from "components/viewbox/view-box";
import Button from "react-bootstrap/Button";
import ActionButton from "components/app/action-button";
import ExecutableButton from "components/app/executable-button";

const NotificationsSubview = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const [moderatorsCommentsNotify, setModeratorsCommentsNotify] = useState(context.user.loggedIn ? context.user.data.mailPreferences.notifyFromModeratorsComments : false);
    const [tagsChangeNotify, setTagsChangeNotify] = useState(context.user.loggedIn ? context.user.data.mailPreferences.notifyFromTagsChange : false);
    const [statusChangeNotify, setStatusChangeNotify] = useState(context.user.loggedIn ? context.user.data.mailPreferences.notifyFromStatusChange : false);
    const onChangesSave = () => {
        let toastId = toastAwait("Saving changes...");
        return axios.patch("/users/@me/mailPreferences", {
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
            <ProfileSidebar currentNode="notifications" reRouteTo={reRouteTo}/>
            <Col xs={12} md={9}>
                <ViewBox theme={context.getTheme(false)} title="Mail Notifications" description="Configure your mail notifications here.">
                    <Col className="text-center py-4">Please log in to see contents of this page.</Col>
                </ViewBox>
            </Col>
        </React.Fragment>
    }
    const conditionalButton = (conditionEnabled, funcEnable, funcDisable) => {
        if (conditionEnabled) {
            return <ActionButton onClick={funcDisable} variant="danger" text="Disable"/>
        }
        return <ActionButton onClick={funcEnable} variant="success" text="Enable"/>
    };
    const renderContent = () => {
        return <React.Fragment>
            <Row noGutters className="col-12 m-0 p-0 px-3 my-2">
                <Col sm={9} xs={12}>
                    <h4 className="mb-1">Moderator Comments</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Notify me via email when moderator comments idea I'm subscribed to.
                    </span>
                </Col>
                <Col sm={3} xs={6} className="text-sm-right text-left my-auto">
                    {conditionalButton(moderatorsCommentsNotify, () => setModeratorsCommentsNotify(true), () => setModeratorsCommentsNotify(false))}
                </Col>
            </Row>
            <Row noGutters className="col-12 m-0 p-0 px-3 my-2">
                <Col sm={9} xs={12}>
                    <h4 className="mb-1">Tags Change</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Notify me via email when idea I'm subscribed to tags get changed.
                    </span>
                </Col>
                <Col sm={3} xs={6} className="text-sm-right text-left my-auto">
                    {conditionalButton(tagsChangeNotify, () => setTagsChangeNotify(true), () => setTagsChangeNotify(false))}
                </Col>
            </Row>
            <Row noGutters className="col-12 m-0 p-0 px-3 my-2">
                <Col sm={9} xs={12}>
                    <h4 className="mb-1">Status Change</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Notify me via email when idea I'm subscribed to gets closed or opened.
                    </span>
                </Col>
                <Col sm={3} xs={6} className="text-sm-right text-left my-auto">
                    {conditionalButton(statusChangeNotify, () => setStatusChangeNotify(true), () => setStatusChangeNotify(false))}
                </Col>
            </Row>
            <Col xs={12}>
                <ExecutableButton className="m-0 mt-3 ml-3 float-right" variant="success" onClick={onChangesSave}>
                    Save Settings
                </ExecutableButton>
            </Col>
        </React.Fragment>
    };
    return <React.Fragment>
        <ProfileSidebar currentNode="notifications" reRouteTo={reRouteTo}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme(false)} title="Mail Notifications" description="Configure your mail notifications here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default NotificationsSubview;