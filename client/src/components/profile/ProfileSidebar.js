import {renderSidebarRoutes, Sidebar} from "components/commons/sidebar-commons";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {FaRegAddressCard, FaRegBell, FaRegKeyboard} from "react-icons/all";
import {UiCol} from "ui/grid";

export const PROFILE_LIGHT_THEME_COLOR = "#008033";
export const PROFILE_DARK_THEME_COLOR = "#00e25b";

const ProfileSidebar = ({currentNode, reRouteTo}) => {
    const routes = [
        {settings: data => <React.Fragment><FaRegAddressCard className={"mr-1 move-top-1px"} style={data}/> Settings</React.Fragment>},
        {appearance: data => <React.Fragment><FaRegKeyboard className={"mr-1 move-top-1px"} style={data}/> Appearance</React.Fragment>},
        {notifications: data => <React.Fragment><FaRegBell className={"mr-1 move-top-1px"} style={data}/> Notifications</React.Fragment>},
    ];
    const {user} = useContext(AppContext);
    const themeColor = user.darkMode ? PROFILE_DARK_THEME_COLOR : PROFILE_LIGHT_THEME_COLOR;
    return <UiCol xs={12} md={3} as={Sidebar}>
        <ul>{renderSidebarRoutes(routes, themeColor, currentNode, reRouteTo)}</ul>
    </UiCol>
};

export default ProfileSidebar;