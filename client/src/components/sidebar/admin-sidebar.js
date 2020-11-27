import React, {useContext} from 'react';
import {Col} from "react-bootstrap";
import AppContext from "context/app-context";
import {FaAt, FaColumns, FaSlidersH, FaTags, FaUserLock, FaUsersCog} from "react-icons/all";
import {renderSidebarRoutes} from "components/sidebar/sidebar-commons";

const AdminSidebar = (props) => {
    const routes = [
        {general: (data) => <React.Fragment><FaSlidersH className="mr-1 move-top-1px" style={data}/> General</React.Fragment>},
        {tags: (data) => <React.Fragment><FaTags className="mr-1 move-top-1px" style={data}/> Tags</React.Fragment>},
        {social: (data) => <React.Fragment><FaAt className="mr-1 move-top-1px" style={data}/> Social Links</React.Fragment>},
        {webhooks: (data) => <React.Fragment><FaColumns className="mr-1 move-top-1px" style={data}/> Webhooks</React.Fragment>},
        {moderators: (data) => <React.Fragment><FaUsersCog className="mr-1 move-top-1px" style={data}/> Moderators</React.Fragment>},
        {suspended: (data) => <React.Fragment><FaUserLock className="mr-1 move-top-1px" style={data}/> Suspensions</React.Fragment>}
    ];
    const context = useContext(AppContext);
    const themeColor = context.getTheme();

    return <Col xs={12} md={3} className="sidebar">
        <ul>{renderSidebarRoutes(routes, themeColor, props.currentNode, props.reRouteTo)}</ul>
        <div className="small text-black-60">
            Running <img alt='logo' src='https://cdn.feedbacky.net/static/img/logo.png' width='16px' height='16px'/> <a href='https://feedbacky.net' target='_blank' rel="noopener noreferrer" className="text-black-60">Feedbacky</a>
            <span className="text-black-75">{" "}v{context.clientVersion}</span>
            <br/>
            Server Version <span className="text-black-75">v{context.serviceData.serverVersion}</span>
        </div>
    </Col>
};

export default AdminSidebar;