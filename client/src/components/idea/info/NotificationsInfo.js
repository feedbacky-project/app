import axios from "axios";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext} from "react";
import {FaRegBell, FaRegBellSlash} from "react-icons/fa";
import {UiClickableTip, UiThemeContext} from "ui";
import {UiLoadableButton} from "ui/button";
import {popupError, popupNotification} from "utils/basic-utils";

const NotificationsInfo = () => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {onNotLoggedClick} = useContext(BoardContext);
    const {ideaData, updateState} = useContext(IdeaContext);

    const onSubscribeToggle = () => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return Promise.resolve();
        }
        const request = ideaData.subscribed ? "DELETE" : "POST";
        return axios({
            method: request,
            url: "/ideas/" + ideaData.id + "/subscribers"
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            updateState({...ideaData, subscribed: !ideaData.subscribed});
            popupNotification("Notifications toggled", getTheme());
        });
    };
    const renderButton = () => {
        return <UiLoadableButton label={"Subscribe Toggle"} small onClick={onSubscribeToggle}>
            {ideaData.subscribed ?
                <React.Fragment><FaRegBellSlash className={"move-top-1px"}/> Unsubscribe</React.Fragment>
                : <React.Fragment><FaRegBell className={"move-top-1px"}/> Subscribe</React.Fragment>}
        </UiLoadableButton>
    };
    return <React.Fragment>
        <div className={"my-1 text-black-75"}>
            Notifications
            <UiClickableTip id={"subTip"} title={"Subscribe"} description={"Subscribe idea to receive mail notifications, configure settings at profile page."}/>
        </div>
        {renderButton()}
    </React.Fragment>
};

export default NotificationsInfo;