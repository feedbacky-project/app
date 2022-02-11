import UndrawSetUrl from "assets/svg/undraw/set_url.svg";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import React from 'react';
import {UiFormControl, UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";

const StepThirdSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <SetupImageBanner svg={UndrawSetUrl} stepName={"Set Webhook URL"} stepDescription={"Type webhook link URL where events data will be send. Please include https:// or http:// at the beginning."}/>
        <UiCol xs={12} md={{span: 8, offset: 2}} className={"mt-4"}>
            <UiFormLabel className={"mb-2"}>Webhook URL</UiFormLabel>
            <UiFormControl id={"url"} rows={1} type={"text"} defaultValue={settings.url} placeholder={"Example https://feedbacky.net/webhook/api/1234"} label={"Type webhook URL"}
                           onChange={e => updateSettings({...settings, url: e.target.value})}/>
        </UiCol>
    </React.Fragment>
};

export default StepThirdSubroute;