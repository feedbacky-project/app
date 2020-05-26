import React, {useContext} from 'react';
import {Col} from "react-bootstrap";
import AppContext from "context/app-context";
import {FaRegAddressCard, FaRegBell} from "react-icons/all";
import {renderSidebarRoutes} from "components/sidebar/sidebar-commons";

const ProfileSidebar = (props) => {
    const routes = [
        {settings: (data) => <React.Fragment><FaRegAddressCard className="mr-1 move-top-1px" style={data}/> Settings</React.Fragment>},
        {notifications: (data) => <React.Fragment><FaRegBell className="mr-1 move-top-1px" style={data}/> Notifications</React.Fragment>},
    ];
    const context = useContext(AppContext);
    const themeColor = context.user.darkMode ? "#00c851" : "#00a040";

    return <Col xs={12} md={3} className="sidebar">
        <ul>{renderSidebarRoutes(routes, themeColor, props.currentNode, props.reRouteTo)}</ul>
    </Col>
};

export default ProfileSidebar;