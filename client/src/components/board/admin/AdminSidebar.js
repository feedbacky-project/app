import {renderSidebarRoutes, Sidebar} from "components/commons/sidebar-commons";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {FaAt, FaColumns, FaSlidersH, FaTags, FaUserLock, FaUsersCog} from "react-icons/all";
import {UiCol} from "ui/grid";

const AdminSidebar = ({currentNode, reRouteTo}) => {
    const routes = [
        {general: data => <React.Fragment><FaSlidersH className={"mr-1 move-top-1px"} style={data}/> General</React.Fragment>},
        {tags: data => <React.Fragment><FaTags className={"mr-1 move-top-1px"} style={data}/> Tags</React.Fragment>},
        {social: data => <React.Fragment><FaAt className={"mr-1 move-top-1px"} style={data}/> Social Links</React.Fragment>},
        {webhooks: data => <React.Fragment><FaColumns className={"mr-1 move-top-1px"} style={data}/> Webhooks</React.Fragment>},
        {moderators: data => <React.Fragment><FaUsersCog className={"mr-1 move-top-1px"} style={data}/> Moderators</React.Fragment>},
        {suspended: data => <React.Fragment><FaUserLock className={"mr-1 move-top-1px"} style={data}/> Suspensions</React.Fragment>}
    ];
    const context = useContext(AppContext);
    const themeColor = context.getTheme();

    return <UiCol xs={12} md={3} as={Sidebar}>
        <ul>{renderSidebarRoutes(routes, themeColor, currentNode, reRouteTo)}</ul>
        <div className={"small text-black-60"}>
            Running <img alt={"Logo"} src={"https://cdn.feedbacky.net/static/img/logo.png"} width={16} height={16}/> <a href={"https://feedbacky.net"} target={"_blank"} rel={"noopener noreferrer"} className={"text-black-60"}>Feedbacky</a>
            <span className={"text-black-75"}>{" "}v{context.clientVersion}</span>
            <br/>
            Server Version <span className={"text-black-75"}>v{context.serviceData.serverVersion}</span>
        </div>
    </UiCol>
};

export default AdminSidebar;