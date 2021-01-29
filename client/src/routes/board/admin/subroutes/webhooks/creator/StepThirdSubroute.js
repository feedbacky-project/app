import UndrawSetUrl from "assets/svg/undraw/set_url.svg";
import React from 'react';
import {Form} from "react-bootstrap";
import UiCol from "ui/grid/UiCol";

const StepThirdSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawSetUrl} className={"my-2"} width={150} height={150}/>
            <h2>Set Webhook URL</h2>
            <span className={"text-black-60"}>
                Type webhook link URL where events data will be send.
            </span>
        </UiCol>
        <UiCol sm={12} md={10} className={"offset-md-1 mt-4 px-md-5 px-3"}>
            <div className={"text-black-60 mb-2"}>
                Webhook URL
            </div>
            <Form.Control style={{minHeight: 38, resize: "none"}} rows={1} required type={"text"}
                          placeholder={"URL to webhook, include http/https:// state."} id={"url"} defaultValue={settings.url}
                          onChange={() => updateSettings({...settings, url: document.getElementById("url").value})}/>
        </UiCol>
    </React.Fragment>
};

export default StepThirdSubroute;