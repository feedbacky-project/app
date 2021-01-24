import React, {useContext, useEffect, useState} from 'react';
import AppContext from "context/app-context";
import {toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import axios from "axios";
import {Col, Row} from "react-bootstrap";
import ViewBox from "components/viewbox/view-box";
import ExecutableButton from "components/app/executable-button";
import PageNodesContext from "../../../context/page-nodes-context";
import tinycolor from "tinycolor2";
import PageButton from "../../../components/app/page-button";

const NotificationsSubview = () => {
    const context = useContext(AppContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [notificationsEnabled, setNotificationsEnabled] = useState(context.user.loggedIn ? context.user.data.mailPreferences.notificationsEnabled : false);
    useEffect(() => setCurrentNode("notifications"), []);
    const onChangesSave = () => {
        let toastId = toastAwait("Saving changes...");
        return axios.patch("/users/@me/mailPreferences", {
            notificationsEnabled: notificationsEnabled,
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            context.user.data.mailPreferences.setNotificationsEnabled = setNotificationsEnabled;
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
        return <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme(false)} title="Mail Notifications" description="Configure your mail notifications here.">
                <Col className="text-center py-4">Please log in to see contents of this page.</Col>
            </ViewBox>
        </Col>
    }
    const conditionalButton = (conditionEnabled, funcEnable, funcDisable) => {
        if (conditionEnabled) {
            return <PageButton color={tinycolor("#ff3547")} className="m-0 mt-sm-0 mt-2" onClick={funcDisable}>Disable</PageButton>
        }
        return <PageButton color={tinycolor("#00c851")} className="m-0 mt-sm-0 mt-2" onClick={funcEnable}>Enable</PageButton>
    };
    const renderContent = () => {
        return <React.Fragment>
            <Row noGutters className="col-12 m-0 p-0 px-3 my-2">
                <Col sm={9} xs={12}>
                    <h4 className="mb-1">Email Notification Alerts</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Notify me when content I'm subscribed to gets updated.
                    </span>
                </Col>
                <Col sm={3} xs={6} className="text-sm-right text-left my-auto">
                    {conditionalButton(notificationsEnabled, () => setNotificationsEnabled(true), () => setNotificationsEnabled(false))}
                </Col>
            </Row>
            <Col xs={12}>
                <ExecutableButton color={tinycolor("#00c851")} className="m-0 mt-3 ml-3 float-right" onClick={onChangesSave}>
                    Save Settings
                </ExecutableButton>
            </Col>
        </React.Fragment>
    };
    return <Col xs={12} md={9}>
        <ViewBox theme={context.getTheme(false)} title="Mail Notifications" description="Configure your mail notifications here.">
            {renderContent()}
        </ViewBox>
    </Col>
};

export default NotificationsSubview;