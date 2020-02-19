import React from 'react';
import ErrorView from "./errors/ErrorView";
import {IoMdConstruct} from "react-icons/io";

const Maintenance = () => {
    return <ErrorView iconMd={<IoMdConstruct style={{fontSize: 250, color: "#0994f6"}}/>}
                      iconSm={<IoMdConstruct style={{fontSize: 180, color: "#0994f6"}}/>} message="Website is under Maintenance. We're back soon!"/>
};

export default Maintenance;