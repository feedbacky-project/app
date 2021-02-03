import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import {SvgNotice} from "components/commons/SvgNotice";
import ComponentLoader from "components/ComponentLoader";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import React, {useContext, useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {UiBadge, UiClickableTip, UiLoadingSpinner} from "ui";
import {UiButton, UiElementDeleteButton} from "ui/button";
import {UiCol} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {prettifyEnum, toastError, toastSuccess} from "utils/basic-utils";

const WebhooksSubroute = () => {
    const {data: boardData} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [webhooks, setWebhooks] = useState({data: [], loaded: false, error: false});
    const [modal, setModal] = useState({open: false, data: -1, dataName: ""});
    useEffect(() => setCurrentNode("webhooks"), [setCurrentNode]);
    const getQuota = () => 5 - webhooks.data.length;
    useEffect(() => {
        axios.get("/boards/" + boardData.discriminator + "/webhooks").then(res => {
            if (res.status !== 200) {
                setWebhooks({...webhooks, error: true});
                return;
            }
            const data = res.data;
            setWebhooks({...webhooks, data, loaded: true});
        }).catch(() => setWebhooks({...webhooks, error: true}));
        // eslint-disable-next-line
    }, []);
    const renderWebhooks = () => {
        if (webhooks.data.length === 0) {
            return <SvgNotice Component={UndrawNoData} title={"No webhooks yet."} description={"How about creating one?"}/>
        }
        return webhooks.data.map((hook, i) => {
            return <div className={"d-inline-flex justify-content-center mr-2"} key={hook.id}>
                <div className={"text-center"}>
                    <img alt={"Webhook"} className={"rounded bg-dark p-2"} src={getTypeIcon(hook)} height={40} width={40}/>
                    <UiElementDeleteButton id={"webhook_del_" + i} tooltipName={"Delete"}
                                           onClick={() => setModal({open: true, data: hook.id, dataName: prettifyEnum(hook.type) + " #" + hook.id})}/>
                    <br/>
                    <small className={"text-truncate text-center d-block"}>{prettifyEnum(hook.type) + " #" + hook.id}</small>
                    <div className={"disable-scrollbars"} style={{maxHeight: 80, overflowY: "scroll"}}>
                        {renderEvents(hook)}
                    </div>
                </div>
            </div>
        })
    };
    const renderContent = () => {
        if (webhooks.error) {
            return <span className={"text-danger"}>Failed to obtain webhooks data</span>
        }
        return <ComponentLoader loaded={webhooks.loaded} component={
            <UiCol xs={12} className={"mb-sm-0 mb-3"}>
                <div className={"text-black-60 mb-1"}>
                    <span className={"mr-1"}>Webhooks Quota ({getQuota()} left)</span>
                    <UiClickableTip id={"moderatorsQuota"} title={"Webhooks Quota"} description={"Amount of webhooks your board can have."}/>
                </div>
                {renderWebhooks()}
                <div>
                    <UiButton className={"m-0 mt-3 float-right"} as={Link} to={"/ba/" + boardData.discriminator + "/webhooks/create"}>Add New</UiButton>
                </div>
            </UiCol>
        } loader={<UiCol className={"text-center my-5 py-5"}><UiLoadingSpinner/></UiCol>}/>
    };
    const getTypeIcon = (hook) => {
        switch (hook.type) {
            case "DISCORD":
                return "https://cdn.feedbacky.net/social/default-discord.svg";
            case "CUSTOM_ENDPOINT":
                return "https://cdn.feedbacky.net/social/default-website.svg";
            default:
                return "";
        }
    };
    const renderEvents = (hook) => {
        return hook.events.map(event => <div key={hook.id + event}><UiBadge className={"d-block my-1"}>{prettifyEnum(event)}</UiBadge></div>);
    };
    const onWebhookDelete = () => {
        return axios.delete("/webhooks/" + modal.data).then(res => {
            if (res.status !== 204) {
                toastError();
                return;
            }
            const data = webhooks.data.filter(item => item.id !== modal.data);
            setWebhooks({...webhooks, data});
            toastSuccess("Webhook deleted.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    return <UiCol xs={12} md={9}>
        <DangerousActionModal id={"webhookDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onWebhookDelete}
                              actionDescription={<div>Webhook <UiBadge>{modal.dataName}</UiBadge> will be <u>deleted</u> and won't receive any future data.</div>}/>
        <UiViewBox title={"Webhooks"} description={"Edit webhooks to integrate with other apps here."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default WebhooksSubroute;