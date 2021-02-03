import UndrawSetUrl from "assets/svg/undraw/set_url.svg";
import React from 'react';
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";

const StepThirdSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawSetUrl} className={"my-2"} width={150} height={150}/>
            <h2>Set Webhook URL</h2>
            <span className={"text-black-60"}>
                Type webhook link URL where events data will be send.
                Please include https:// or http:// at the beginning.
            </span>
        </UiCol>
        <UiCol xs={12} md={{span: 8, offset: 2}} className={"mt-4"}>
            <div className={"text-black-60 mb-2"}>
                Webhook URL
            </div>
            <UiFormControl id={"url"} rows={1} type={"text"} defaultValue={settings.url} placeholder={"Example https://feedbacky.net/webhook/api/1234"}
                           onChange={e => updateSettings({...settings, url: e.target.value})}/>
        </UiCol>
    </React.Fragment>
};

export default StepThirdSubroute;