import {renderSidebarRoutes, Sidebar} from "components/commons/sidebar-commons";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {FaRegAddressCard, FaRegBell} from "react-icons/all";
import {UiCol} from "ui/grid";

const ProfileSidebar = ({currentNode, reRouteTo}) => {
    const routes = [
        {settings: data => <React.Fragment><FaRegAddressCard className={"mr-1 move-top-1px"} style={data}/> Settings</React.Fragment>},
        {notifications: data => <React.Fragment><FaRegBell className={"mr-1 move-top-1px"} style={data}/> Notifications</React.Fragment>},
    ];
    const {user} = useContext(AppContext);
    const themeColor = user.darkMode ? "#00e25b" : "#008033";

    return <UiCol xs={12} md={3} as={Sidebar}>
        <ul>{renderSidebarRoutes(routes, themeColor, currentNode, reRouteTo)}</ul>
    </UiCol>
};

export default ProfileSidebar;