import {renderSidebarRoutes, Sidebar, SidebarIcon} from "components/commons/sidebar-commons";
import {BoardContext} from "context";
import React, {useContext} from 'react';
import {FaRegAddressCard, FaRegBell, FaRegKeyboard} from "react-icons/fa";
import {UiThemeContext} from "ui";
import {UiCol} from "ui/grid";

const ProfileSidebar = ({currentNode, reRouteTo}) => {
    const routes = [
        {settings: data => <React.Fragment><SidebarIcon as={FaRegAddressCard} style={data}/> Settings</React.Fragment>},
        {appearance: data => <React.Fragment><SidebarIcon as={FaRegKeyboard} style={data}/> Appearance</React.Fragment>},
        {notifications: data => <React.Fragment><SidebarIcon as={FaRegBell} style={data}/> Notifications</React.Fragment>},
    ];
    const {defaultTheme, getTheme} = useContext(UiThemeContext);
    const {data} = useContext(BoardContext);
    let theme = defaultTheme;
    if(data !== null) {
        theme = getTheme();
    }

    return <UiCol xs={12} md={3} as={Sidebar} theme={theme.toString()}>
        <ul>{renderSidebarRoutes(routes, theme, currentNode, reRouteTo)}</ul>
    </UiCol>
};

export default ProfileSidebar;