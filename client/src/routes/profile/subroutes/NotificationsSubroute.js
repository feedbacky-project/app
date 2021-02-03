import axios from "axios";
import AppContext from "context/AppContext";
import PageNodesContext from "context/PageNodesContext";
import React, {useContext, useEffect, useState} from 'react';
import tinycolor from "tinycolor2";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiCol} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {toastAwait, toastError, toastSuccess, toastWarning} from "utils/basic-utils";

const NotificationsSubroute = () => {
    const {user, getTheme} = useContext(AppContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [notificationsEnabled, setNotificationsEnabled] = useState(user.loggedIn ? user.data.mailPreferences.notificationsEnabled : false);
    useEffect(() => setCurrentNode("notifications"), [setCurrentNode]);
    const onChangesSave = () => {
        let toastId = toastAwait("Saving changes...");
        return axios.patch("/users/@me/mailPreferences", {
            notificationsEnabled: notificationsEnabled,
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            user.data.mailPreferences.setNotificationsEnabled = setNotificationsEnabled;
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
    if (!user.loggedIn) {
        return <UiCol xs={12} md={9}>
            <UiViewBox theme={getTheme(false)} title={"Mail Notifications"} description={"Configure your mail notifications here."}>
                <UiCol className={"text-center py-4"}>Please log in to see contents of this page.</UiCol>
            </UiViewBox>
        </UiCol>
    }
    const conditionalButton = (conditionEnabled, funcEnable, funcDisable) => {
        if (conditionEnabled) {
            return <UiButton color={tinycolor("#ff3547")} onClick={funcDisable}>Disable</UiButton>
        }
        return <UiButton color={tinycolor("#00c851")} onClick={funcEnable}>Enable</UiButton>
    };
    const renderContent = () => {
        return <React.Fragment>
            <UiCol sm={9} xs={12} className={"my-2"}>
                <h4 className={"mb-1"}>Email Notification Alerts</h4>
                <span className={"text-black-60"} style={{fontSize: ".9em"}}>
                        Notify me when content I'm subscribed to gets updated.
                    </span>
            </UiCol>
            <UiCol sm={3} xs={6} className={"text-sm-right text-left my-auto"}>
                {conditionalButton(notificationsEnabled, () => setNotificationsEnabled(true), () => setNotificationsEnabled(false))}
            </UiCol>
            <UiCol xs={12}>
                <UiLoadableButton color={tinycolor("#00c851")} className={"mt-3 float-right"} onClick={onChangesSave}>
                    Save Settings
                </UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    return <UiCol xs={12} md={9}>
        <UiViewBox theme={getTheme(false)} title={"Mail Notifications"} description={"Configure your mail notifications here."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default NotificationsSubroute;