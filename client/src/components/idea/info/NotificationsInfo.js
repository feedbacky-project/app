import axios from "axios";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext} from "react";
import {FaRegBell, FaRegBellSlash} from "react-icons/all";
import {UiClickableTip} from "ui";
import {UiLoadableButton} from "ui/button";
import {toastError, toastSuccess} from "utils/basic-utils";

const NotificationsInfo = () => {
    const {user} = useContext(AppContext);
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
            url: "/ideas/" + ideaData.id + "/subscribe"
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            updateState({...ideaData, subscribed: !ideaData.subscribed});
            toastSuccess("Toggled mail notifications for this idea.");
        });
    };
    const renderButton = () => {
        return <UiLoadableButton label={"Subscribe Toggle"} size={"sm"} onClick={onSubscribeToggle}>
            {ideaData.subscribed ?
                <React.Fragment><FaRegBellSlash className={"move-top-1px"}/> Unsubscribe</React.Fragment>
                : <React.Fragment><FaRegBell className={"move-top-1px"}/> Subscribe</React.Fragment>}
        </UiLoadableButton>
    };
    return <React.Fragment>
        <div className={"my-1 text-black-75"}>
            Mail Subscription
            <UiClickableTip id={"subTip"} title={"Mail Subscriptions"} description={"Subscribe idea to receive mail notifications, configure settings at profile page."}/>
        </div>
        {renderButton()}
    </React.Fragment>
};

export default NotificationsInfo;