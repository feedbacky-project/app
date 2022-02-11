import UndrawCreateProject from "assets/svg/undraw/create_project.svg";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import React from 'react';
import {UiClickableTip, UiKeyboardInput} from "ui";
import {UiCountableFormControl, UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";

const StepFirstSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <SetupImageBanner svg={UndrawCreateProject} stepName={"Choose Name and Discriminator"} stepDescription={"Type how your board will be named and discriminator under which users will access it."}/>
        <UiCol xs={12} sm={6} className={"mt-4 px-md-5 px-3"}>
            <UiFormLabel>Board Discriminator</UiFormLabel>
            <UiClickableTip id={"boardDiscriminator"} title={"Set Board Discriminator"}
                            description={<React.Fragment>Text with alphanumeric characters <UiKeyboardInput>a-Z 0-9 and -</UiKeyboardInput>
                                <br/>
                                <strong>Example:</strong> Project is called My Awesome Project
                                discriminator can be set to <UiKeyboardInput>myawproj</UiKeyboardInput> or similar.
                                <br/>
                                <strong>Minimum 3 and maximum 20 characters.</strong></React.Fragment>}/>

            <UiCountableFormControl label={"Type board discriminator"} id={"discriminator"} minLength={3} maxLength={20} placeholder={"Example: git-tool-feedback"}
                                    defaultValue={settings.discriminator} onChange={e => updateSettings({...settings, discriminator: e.target.value})}/>
        </UiCol>
        <UiCol xs={12} sm={6} className={"mt-4 px-md-5 px-3"}>
            <UiFormLabel>Board Name</UiFormLabel>
            <UiClickableTip id={"boardName"} title={"Set Board Name"} description={"Name of your board should be at least 4 and maximum 25 characters long."}/>
            <UiCountableFormControl label={"Type board name"} id={"name"} minLength={4} maxLength={25} placeholder={"Short name of board."} defaultValue={settings.name}
                                    onChange={e => updateSettings({...settings, name: e.target.value})}/>
        </UiCol>
    </React.Fragment>
};

export default StepFirstSubroute;