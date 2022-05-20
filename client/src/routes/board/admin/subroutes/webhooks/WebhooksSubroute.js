import styled from "@emotion/styled";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import WebhookUpdateModal from "components/commons/modal/WebhookUpdateModal";
import {SvgNotice} from "components/commons/SvgNotice";
import ComponentLoader from "components/ComponentLoader";
import {BoardContext, PageNodesContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import {FaTrash} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiBadge, UiLoadingSpinner, UiThemeContext} from "ui";
import {UiButton, UiElementDeleteButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiImage} from "ui/image";
import {UiViewBox} from "ui/viewbox";
import {popupError, popupNotification, prettifyEnum} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const Webhook = styled.div`
  display: inline-flex;
  justify-content: center;
  text-align: center;
  margin: .5em;
`;

const EventsContainer = styled.div`
  max-height: 80px;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */

  &::-webkit-scrollbar {
    width: 0;
    background: transparent; /* Chrome/Safari/Webkit */
  }
`;

const WebhookIcon = styled(UiImage)`
  padding: .5rem;
  background-color: hsl(213, 7%, 24%);
  cursor: pointer;
`;

const WebhooksSubroute = () => {
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [webhooks, setWebhooks] = useState({data: [], loaded: false, error: false});
    const [modal, setModal] = useState({open: false, type: "", data: -1, dataName: ""});
    useEffect(() => setCurrentNode("webhooks"), [setCurrentNode]);
    useTitle(boardData.name + " | Webhooks");
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
            const onDelete = () => setModal({open: true, type: "delete", data: hook.id, dataName: prettifyEnum(hook.type) + " #" + hook.id});
            return <Webhook key={hook.id}>
                <div className={"text-center"}>
                    <WebhookIcon alt={"Webhook"} rounded src={getTypeIcon(hook)} height={40} width={40} onClick={() => onWebhookEdit(hook)}/>
                    <UiElementDeleteButton id={"webhook_del_" + i} tooltipName={"Delete"} onClick={onDelete}/>
                    <br/>
                    <small className={"text-truncate text-center d-block"}>{prettifyEnum(hook.type) + " #" + hook.id}</small>
                    <EventsContainer>{renderTriggers(hook)}</EventsContainer>
                </div>
            </Webhook>
        })
    };
    const renderContent = () => {
        if (webhooks.error) {
            return <span className={"text-red"}>Failed to obtain webhooks data</span>
        }
        return <ComponentLoader loaded={webhooks.loaded} component={
            <UiCol xs={12} className={"mb-sm-0 mb-3"}>
                <div>
                    <UiFormLabel>Created Webhooks</UiFormLabel>
                </div>
                {renderWebhooks()}
                <div>
                    <UiButton label={"Add New"} className={"m-0 mt-3 float-right"} as={Link} to={"/ba/" + boardData.discriminator + "/webhooks/create"}>Add New</UiButton>
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
    const renderTriggers = (hook) => {
        return hook.triggers.map(trigger => <div key={hook.id + trigger}><UiBadge className={"d-block my-1"}>{prettifyEnum(trigger)}</UiBadge></div>);
    };
    const onWebhookUpdate = (webhook) => {
        const newWebhooks = [...webhooks.data];
        const index = newWebhooks.findIndex(c => c.id === webhook.id);
        newWebhooks[index] = webhook;
        setWebhooks({...webhooks, data: newWebhooks});
    };
    const onWebhookDelete = () => {
        return axios.delete("/webhooks/" + modal.data).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            const data = webhooks.data.filter(item => item.id !== modal.data);
            setWebhooks({...webhooks, data});
            popupNotification("Webhook deleted", getTheme());
        });
    };
    const onWebhookEdit = (webhook) => {
        setModal({open: true, type: "edit", data: webhook, dataName: ""});
    };
    return <UiCol xs={12}>
        <DangerousActionModal id={"webhookDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "delete"} onAction={onWebhookDelete}
                              actionDescription={<div>Webhook <UiBadge>{modal.dataName}</UiBadge> will be <u>deleted</u> and won't receive any future data.</div>} Icon={FaTrash}/>
        <WebhookUpdateModal onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "edit"} webhook={modal.data} onWebhookUpdate={onWebhookUpdate}/>
        <UiViewBox title={"Webhooks"} description={"Edit webhooks to integrate with other apps here."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default WebhooksSubroute;