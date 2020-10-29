import React, {useContext, useEffect, useState} from 'react';
import AppContext from "context/app-context";
import axios from "axios";
import {prettifyEnum, toastError, toastSuccess} from "components/util/utils";
import AdminSidebar from "components/sidebar/admin-sidebar";
import {Button, Col} from "react-bootstrap";
import {Link} from "react-router-dom";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import DeleteButton from "components/util/delete-button";
import ViewBox from "components/viewbox/view-box";
import PageBadge from "components/app/page-badge";
import ComponentLoader from "components/app/component-loader";
import BoardContext from "context/board-context";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {SvgNotice} from "components/app/svg-notice";

const WebhooksSettings = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const [webhooks, setWebhooks] = useState({data: [], loaded: false, error: false});
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
            return <SvgNotice Component={UndrawNoData} title="No webhooks yet." description="How about creating one?"/>
        }
        return webhooks.data.map((hook, i) => {
            return <div className="d-inline-flex justify-content-center mr-2" key={hook.id}>
                <div className="text-center">
                    <img alt="Webhook" className="rounded bg-dark p-2" src={getTypeIcon(hook)} height={40} width={40}/>
                    <DeleteButton id={"webhook_del_" + i} onClick={() => onWebhookDelete(hook)} tooltipName="Delete"/>
                    <br/>
                    <small className="text-truncate text-center d-block">{prettifyEnum(hook.type) + " #" + hook.id}</small>
                    <div className="disable-scrollbars" style={{maxHeight: 80, overflowY: "scroll"}}>
                        {renderEvents(hook)}
                    </div>
                </div>
            </div>
        })
    };
    const renderContent = () => {
        if (webhooks.error) {
            return <span className="text-danger">Failed to obtain webhooks data</span>
        }
        return <ComponentLoader loaded={webhooks.loaded} component={
            <React.Fragment>
                <Col xs={12} className="mb-sm-0 mb-3">
                    <div className="text-black-60 mb-1">
                        <span className="mr-1">Webhooks Quota ({getQuota()} left)</span>
                        <ClickableTip id="moderatorsQuota" title="Webhooks Quota" description="Amount of webhooks your board can have."/>
                    </div>
                    {renderWebhooks()}
                    <div>
                        <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}}
                                as={Link} to={"/ba/" + boardData.discriminator + "/webhooks/create"}>Add New</Button>
                    </div>
                </Col>
            </React.Fragment>
        }/>
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
        return hook.events.map(event => <div key={hook.id + event}><PageBadge className="d-block my-1" text={prettifyEnum(event)} color={context.getTheme()}/></div>);
    };
    const onWebhookDelete = (hook) => {
        popupSwal("warning", "Dangerous action", "Webhook will be permanently removed and won't send data to target URL.",
            "Delete", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/webhooks/" + hook.id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = webhooks.data.filter(item => item.id !== hook.id);
                    setWebhooks({...webhooks, data});
                    toastSuccess("Webhook deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    return <React.Fragment>
        <AdminSidebar currentNode="webhooks" reRouteTo={reRouteTo} data={boardData}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="Webhooks"
                     description="Edit webhooks to integrate with other apps here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default WebhooksSettings;