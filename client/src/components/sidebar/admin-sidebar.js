import React, {useContext} from 'react';
import {Col} from "react-bootstrap";
import {increaseBrightness, isHexDark} from "../util/utils";
import AppContext from "../../context/app-context";
import {FaAt, FaColumns, FaRegEnvelope, FaSlidersH, FaTags, FaUsersCog} from "react-icons/all";

const AdminSidebar = (props) => {
    const context = useContext(AppContext);
    const themeColor = isHexDark(context.theme) && context.user.darkMode ? increaseBrightness(context.theme, 40) : context.theme;
    //todo fix this mess
    const general = props.currentNode === "general" ? {color: themeColor} : {};
    const generalIcon = props.currentNode === "general" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const tags = props.currentNode === "tags" ? {color: themeColor} : {};
    const tagsIcon = props.currentNode === "tags" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const social = props.currentNode === "social" ? {color: themeColor} : {};
    const socialIcon = props.currentNode === "social" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const webhooks = props.currentNode === "webhooks" ? {color: themeColor} : {};
    const webhooksIcon = props.currentNode === "webhooks" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const moderators = props.currentNode === "moderators" ? {color: themeColor} : {};
    const moderatorsIcon = props.currentNode === "moderators" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
    const invitations = props.currentNode === "invitations" ? {color: themeColor} : {};
    const invitationsIcon = props.currentNode === "invitations" ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};

    return <Col xs={12} md={3} className="mt-4" id="sidebar">
        <ul className="pl-0 mb-1" style={{listStyle: "none", fontSize: "1.1rem", fontWeight: 500, lineHeight: "2rem"}}>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("general")} style={general}>
                    <FaSlidersH className="fa-sm mr-1 move-top-2px" style={generalIcon}/> General
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("tags")} style={tags}>
                    <FaTags className="fa-sm mr-1 move-top-2px" style={tagsIcon}/> Tags
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("social")} style={social}>
                    <FaAt className="fa-sm mr-1 move-top-2px" style={socialIcon}/> Social Links
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("webhooks")} style={webhooks}>
                    <FaColumns className="fa-sm mr-1 move-top-2px" style={webhooksIcon}/> Webhooks
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("moderators")} style={moderators}>
                    <FaUsersCog className="fa-sm mr-1 move-top-2px" style={moderatorsIcon}/> Moderators
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("invitations")} style={invitations}>
                    <FaRegEnvelope className="fa-sm mr-1 move-top-2px" style={invitationsIcon}/> Invitations
                </a>
            </li>
        </ul>
    </Col>
};

export default AdminSidebar;