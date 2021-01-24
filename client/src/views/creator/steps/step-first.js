import React from 'react';
import {Col} from "react-bootstrap";
import ClickableTip from "components/util/clickable-tip";
import UndrawCreateProject from "assets/svg/undraw/create_project.svg";
import PageCountableFormControl from "../../../components/app/page-countable-form-control";

const StepFirst = ({updateSettings, settings}) => {
    return <React.Fragment>
        <Col xs={12} className="mt-4 text-center">
            <img alt="" src={UndrawCreateProject} className="my-2" width={150} height={150}/>
            <h2>Choose Name and Discriminator</h2>
            <span className="text-black-60">
                Type how your board will be named and discriminator under which users will access it.
            </span>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <div className="text-black-60 mb-2">
                <span className="mr-1">Board Discriminator</span>
                <ClickableTip id="boardDiscriminator" title="Set Board Discriminator"
                              description={<React.Fragment>Must be an unique combination of alphanumeric characters.
                                  <br/>
                                  For example if your project is called My Awesome Project
                                  you can set your discriminator to <kbd>myawproj</kbd> or something similar
                                  <br/>
                                  <strong>Minimum 3 and maximum of 20 characters.</strong></React.Fragment>}/>
            </div>
            <PageCountableFormControl id={"discriminator"} minLength={3} maxLength={20} placeholder={"Short discriminator eg. my-project-123."}
                                      defaultValue={settings.discriminator} onChange={e => updateSettings({...settings, discriminator: e.target.value})}/>
        </Col>
        <Col xs={12} sm={6} className="mt-4 px-md-5 px-3">
            <div className="text-black-60 mb-2">
                <span className="mr-1">Board Name</span>
                <ClickableTip id="boardName" title="Set Board Name" description="Name of your board should be at least 4 and maximum 25 characters long."/>
            </div>
            <PageCountableFormControl id={"name"} minLength={4} maxLength={25} placeholder={"Short name of board."} defaultValue={settings.name}
                                      onChange={e => updateSettings({...settings, name: e.target.value})}/>
        </Col>
    </React.Fragment>
};

export default StepFirst;