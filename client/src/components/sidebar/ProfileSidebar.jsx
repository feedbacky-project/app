import React, {useContext} from 'react';
import {Col} from "react-bootstrap";
import Attribution from "../util/Attribution";
import {increaseBrightness, isHexDark} from "../util/Utils";
import AppContext from "../../context/AppContext";
import {AiOutlineBell, AiOutlineProfile, AiOutlineSearch} from "react-icons/ai";
import Badge from "react-bootstrap/Badge";

const ProfileSidebar = (props) => {
    const context = useContext(AppContext);
    const themeColor = isHexDark(context.theme) && context.user.darkMode ? increaseBrightness(context.theme, 40) : context.theme;
    const settings = props.currentNode === "settings" ? {color: themeColor} : {};
    const settingsIcon = props.currentNode === "settings" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const explore = props.currentNode === "explore" ? {color: themeColor} : {};
    const exploreIcon = props.currentNode === "explore" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const notifications = props.currentNode === "notifications" ? {color: themeColor} : {};
    const notificationsIcon = props.currentNode === "notifications" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};


    return <Col xs={12} md={3} className="mt-4" id="sidebar">
        <ul className="pl-0 mb-1" style={{listStyle: "none", fontSize: "1.1rem", fontWeight: 500, lineHeight: "2rem"}}>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("settings")} style={settings}>
                    <AiOutlineProfile className="fa-md mr-1 move-top-2px" style={settingsIcon}/> Settings
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("explore")} style={explore}>
                    <AiOutlineSearch className="fa-md mr-1 move-top-2px" style={exploreIcon}/> Explore
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("notifications")} style={notifications}>
                    <AiOutlineBell className="fa-md mr-1 move-top-2px" style={notificationsIcon}/> Notifications <Badge variant="warning" className="move-top-2px">Soon</Badge>
                </a>
            </li>
        </ul>
        <Attribution/>
    </Col>
};

export default ProfileSidebar;