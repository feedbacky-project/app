import React, {useContext} from 'react';
import {Col} from "react-bootstrap";
import {TiCogOutline, TiMail, TiSocialAtCircular, TiTags} from "react-icons/ti";
import {AiOutlineUnorderedList, AiOutlineUser} from "react-icons/ai";
import {GoCommentDiscussion} from "react-icons/go";
import {IoIosHelpCircleOutline} from "react-icons/io";
import {FaDiscord} from "react-icons/fa";
import {MdWeb} from "react-icons/md";
import Attribution from "../util/Attribution";
import {increaseBrightness, isHexDark} from "../util/Utils";
import AppContext from "../../context/AppContext";

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
                    <TiCogOutline className="fa-md mr-1 move-top-2px" style={generalIcon}/> General
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("tags")} style={tags}>
                    <TiTags className="fa-md mr-1 move-top-2px" style={tagsIcon}/> Tags
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("social")} style={social}>
                    <TiSocialAtCircular className="fa-md mr-1 move-top-2px" style={socialIcon}/> Social Links
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("webhooks")} style={webhooks}>
                    <MdWeb className="fa-md mr-1 move-top-2px" style={webhooksIcon}/> Webhooks
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("moderators")} style={moderators}>
                    <AiOutlineUser className="fa-md mr-1 move-top-2px" style={moderatorsIcon}/> Moderators
                </a>
            </li>
            <li>
                <a href="#!" onClick={() => props.reRouteTo("invitations")} style={invitations}>
                    <TiMail className="fa-md mr-1 move-top-2px" style={invitationsIcon}/> Invitations
                </a>
            </li>
            <li className="my-4"/>
            <li>
                <a href="https://app.feedbacky.net/b/feedbacky-official">
                    <GoCommentDiscussion className="fa-md mr-1 text-black-50 move-top-2px"/> Feedback
                </a>
            </li>
            <li>
                <a href="https://docs.feedbacky.net">
                    <IoIosHelpCircleOutline className="fa-md mr-1 text-black-50 move-top-2px"/> FAQ
                </a>
            </li>
            <li>
                <a href="https://discordapp.com/invite/6qCnKh5">
                    <FaDiscord className="fa-md mr-1 text-black-50 move-top-2px"/> Discord Support
                </a>
            </li>
        </ul>
        <Attribution/>
    </Col>
};

export default AdminSidebar;