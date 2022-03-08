import UndrawSetUrl from "assets/svg/undraw/set_url.svg";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import React, {useEffect, useRef} from 'react';
import {UiFormControl, UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";

const StepSecondRoute = ({settings, updateSettings}) => {
    const ref = useRef();
    useEffect(() => ref.current && ref.current.focus(), []);

    const onChange = e => updateSettings({...settings, url: e.target.value});
    return <React.Fragment>
        <SetupImageBanner svg={UndrawSetUrl} stepName={"Set Logo Link"} stepDescription={"Set URL your social link will redirect to. Please include https:// or http:// at the beginning."}/>
        <UiCol xs={12} md={{span: 8, offset: 2}} className={"mt-4"}>
            <UiFormLabel className={"mb-2"}>Social URL</UiFormLabel>
            <UiFormControl innerRef={ref} type={"text"} placeholder={"Example https://feedbacky.net"} id={"url"} defaultValue={settings.url} label={"Type logo URL"} onChange={onChange}/>
        </UiCol>
    </React.Fragment>
};

export default StepSecondRoute;