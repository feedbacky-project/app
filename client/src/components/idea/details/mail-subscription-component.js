import React, {useContext} from "react";
import ClickableTip from "components/util/clickable-tip";
import {FaRegBell, FaRegBellSlash} from "react-icons/all";
import AppContext from "context/app-context";
import axios from "axios";
import {toastError, toastSuccess} from "components/util/utils";
import ExecutableButton from "components/app/executable-button";

const MailSubscriptionComponent = ({ideaData, updateState, onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const onSubscribeToggle = () => {
        if (!context.user.loggedIn) {
            onNotLoggedClick();
            return Promise.resolve();
        }
        const request = ideaData.subscribed ? "DELETE" : "POST";
        return axios({
            method: request,
            url: "/ideas/" + ideaData.id + "/subscribe",
            headers: {
                "Authorization": "Bearer " + context.user.session
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            updateState({
                ...ideaData, subscribed: !ideaData.subscribed
            });
            toastSuccess("Toggled mail notifications for this idea.");
        }).catch(() => toastError());
    };
    const renderButton = () => {
        if (ideaData.subscribed) {
            return <ExecutableButton variant="" size="sm" style={{backgroundColor: context.getTheme()}} className="m-0 mt-sm-0"
                                     onClick={onSubscribeToggle}><FaRegBellSlash className="move-top-1px"/> Unsubscribe</ExecutableButton>
        } else {
            return <ExecutableButton variant="" size="sm" style={{backgroundColor: context.getTheme()}} className="m-0 mt-sm-0"
                                     onClick={onSubscribeToggle}><FaRegBell className="move-top-1px"/> Subscribe</ExecutableButton>
        }
    };
    return <React.Fragment>
        <div className="my-1 text-black-75">
            Mail Subscription
            <span className="ml-1"><ClickableTip id="subTip" title="Mail Subscriptions" description="Subscribe idea to receive mail notifications, configure settings at profile page."/></span>
        </div>
        {renderButton()}
    </React.Fragment>
};

export default MailSubscriptionComponent;