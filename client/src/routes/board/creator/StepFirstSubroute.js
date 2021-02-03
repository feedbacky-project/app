import UndrawCreateProject from "assets/svg/undraw/create_project.svg";
import React from 'react';
import {UiClickableTip} from "ui";
import {UiCountableFormControl} from "ui/form";
import {UiCol} from "ui/grid";

const StepFirstSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawCreateProject} className={"my-2"} width={150} height={150}/>
            <h2>Choose Name and Discriminator</h2>
            <span className={"text-black-60"}>
                Type how your board will be named and discriminator under which users will access it.
            </span>
        </UiCol>
        <UiCol xs={12} sm={6} className={"mt-4 px-md-5 px-3"}>
            <div className={"text-black-60 mb-2"}>
                <span className={"mr-1"}>Board Discriminator</span>
                <UiClickableTip id={"boardDiscriminator"} title={"Set Board Discriminator"}
                                description={<React.Fragment>Text with alphanumeric characters <kbd>a-Z 0-9 and -</kbd>
                                    <br/>
                                    <strong>Example:</strong> Project is called My Awesome Project
                                    discriminator can be set to <kbd>myawproj</kbd> or similar.
                                    <br/>
                                    <strong>Minimum 3 and maximum 20 characters.</strong></React.Fragment>}/>
            </div>
            <UiCountableFormControl id={"discriminator"} minLength={3} maxLength={20} placeholder={"Example: git-tool-feedback"}
                                    defaultValue={settings.discriminator} onChange={e => updateSettings({...settings, discriminator: e.target.value})}/>
        </UiCol>
        <UiCol xs={12} sm={6} className={"mt-4 px-md-5 px-3"}>
            <div className={"text-black-60 mb-2"}>
                <span className={"mr-1"}>Board Name</span>
                <UiClickableTip id={"boardName"} title={"Set Board Name"} description={"Name of your board should be at least 4 and maximum 25 characters long."}/>
            </div>
            <UiCountableFormControl id={"name"} minLength={4} maxLength={25} placeholder={"Short name of board."} defaultValue={settings.name}
                                    onChange={e => updateSettings({...settings, name: e.target.value})}/>
        </UiCol>
    </React.Fragment>
};

export default StepFirstSubroute;