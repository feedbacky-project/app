import UndrawSetUrl from "assets/svg/undraw/set_url.svg";
import React from 'react';
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";

const StepSecondRoute = ({settings, updateSettings}) => {
    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawSetUrl} className={"my-2"} width={150} height={150}/>
            <h2>Set Logo Link</h2>
            <span className={"text-black-60"}>
                Set URL your social link will redirect to.
                Please include https:// or http:// at the beginning.
            </span>
        </UiCol>
        <UiCol sm={12} md={10} className={"offset-md-1 mt-4 px-md-5 px-3"}>
            <div className={"text-black-60 mb-2"}>
                Social URL
            </div>
            <UiFormControl type={"text"} placeholder={"Example https://feedbacky.net"} id={"url"} defaultValue={settings.url}
                           onChange={e => updateSettings({...settings, url: e.target.value})}/>
        </UiCol>
    </React.Fragment>
};

export default StepSecondRoute;