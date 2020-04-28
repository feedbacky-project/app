import React from 'react';
import {IoMdConstruct} from "react-icons/io";
import OfflineErrorView from "./errors/offline-error-view";

const MaintenanceView = () => {
    return <OfflineErrorView iconMd={<IoMdConstruct style={{fontSize: 250, color: "#0994f6"}}/>}
                             iconSm={<IoMdConstruct style={{fontSize: 180, color: "#0994f6"}}/>} message="Website is under Maintenance. We're back soon!"/>
};

export default MaintenanceView;