import {CLIENT_VERSION} from "App";
import SafeAnchor from "components/commons/SafeAnchor";
import {renderAdminSidebarRoutes, Sidebar as UiSidebar, SidebarIcon, SidebarToggler} from "components/commons/sidebar-commons";
import {AppContext, BoardContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import {FaAt, FaChevronLeft, FaChevronRight, FaColumns, FaCubes, FaSlidersH, FaSort, FaTags, FaUserLock, FaUsersCog} from "react-icons/fa";
import {Link} from "react-router-dom";
import Sidebar from "react-sidebar";
import {UiHorizontalRule, UiThemeContext} from "ui";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";

const widthQuery = window.matchMedia(`(min-width: 800px)`);

const AdminSidebar = ({currentNode, reRouteTo, children}) => {
    const routes = [
        {general: data => <React.Fragment><SidebarIcon as={FaSlidersH} style={data}/> General</React.Fragment>},
        {tags: data => <React.Fragment><SidebarIcon as={FaTags} style={data}/> Tags</React.Fragment>},
        {social: data => <React.Fragment><SidebarIcon as={FaAt} style={data}/> Social Links</React.Fragment>},
        {webhooks: data => <React.Fragment><SidebarIcon as={FaColumns} style={data}/> Webhooks</React.Fragment>},
        {moderators: data => <React.Fragment><SidebarIcon as={FaUsersCog} style={data}/> Moderators</React.Fragment>},
        {suspended: data => <React.Fragment><SidebarIcon as={FaUserLock} style={data}/> Suspensions</React.Fragment>},
        {integrations: data => <React.Fragment><SidebarIcon as={FaCubes} style={data}/> Integrations</React.Fragment>},
    ];
    const context = useContext(AppContext);
    const {data} = useContext(BoardContext);
    const {darkMode, getTheme} = useContext(UiThemeContext);
    const [open, setOpen] = useState(widthQuery.matches);
    const [mediaMatch, setMediaMatch] = useState(widthQuery.matches);
    useEffect(() => {
        const listener = () => {
            if (widthQuery.matches) {
                setOpen(true);
            }
            setMediaMatch(widthQuery.matches);
        }
        widthQuery.addEventListener("change", listener);
        return () => widthQuery.removeEventListener("change", listener);
    }, []);

    const banner = darkMode ? "https://feedbacky.net/img/product-brand.png" : "https://feedbacky.net/img/product-brand-dark.png";
    const renderSidebar = () => {
        if (!mediaMatch && !open) {
            return <UiSidebar className={"mt-4 px-1"}/>
        }
        if (open) {
            return <UiSidebar className={"mt-4 mx-4 px-1"}>
                <div className={"text-center"}>
                    <img alt={"Product Banner"} src={banner} width={150}/>
                    <UiHorizontalRule/>
                    <div className={"text-left d-inline-flex mb-3"} style={{backgroundColor: "var(--secondary)", padding: ".25rem .75rem", borderRadius: "var(--border-radius)"}}>
                        <img className={"my-auto"} alt={"Board Logo"} src={data.logo} width={30} height={30}/>
                        <div className={"ml-2 small my-auto"}>
                            <div style={{fontWeight: "bold", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", width: "90px"}}>{data.name}</div>
                            <div>Admin Panel</div>
                        </div>
                        <div className={"my-auto"}>
                            <UiDropdown label={"adminPanel"} toggleClassName={"ml-2 p-0"} toggle={<FaSort className={"text-black-60"}/>}>
                                {context.user.data.permissions.map(data => {
                                    return <UiDropdownElement key={data.boardDiscriminator} as={Link} to={"/ba/" + data.boardDiscriminator}>
                                        {data.boardName}
                                    </UiDropdownElement>
                                })}
                            </UiDropdown>
                        </div>
                    </div>
                </div>
                <ul>{renderAdminSidebarRoutes(routes, getTheme(), currentNode, reRouteTo)}</ul>
                <div className={"small text-black-60 mb-3 mr-4"} style={{bottom: 0, position: "absolute"}}>
                    <div>
                        <img alt={"Project Logo"} src={"https://cdn.feedbacky.net/static/img/logo.png"} width={16} height={16}/> <SafeAnchor url={"https://feedbacky.net"} className={"text-blue font-weight-bold"}>Feedbacky</SafeAnchor> Self-Hosted
                    </div>
                    <div>Client Version <span className={"text-black-75"}>{" "}v{CLIENT_VERSION}</span></div>
                    <div>Server Version <span className={"text-black-75"}>v{context.serviceData.serverVersion}</span></div>
                </div>
            </UiSidebar>
        }
    };
    const isDocked = () => {
        if (!mediaMatch) {
            return !open;
        }
        return true;
    }
    const styles = {sidebar: {backgroundColor: "var(--quaternary)", zIndex: 1000, transition: "var(--hover-transition)"}};
    return <React.Fragment>
        <Sidebar as={UiSidebar} theme={getTheme().toString()} open={open} docked={isDocked()} shadow={false} styles={styles}
                 transitions={!mediaMatch} sidebar={renderSidebar()}>
            {children}
        </Sidebar>
        {!mediaMatch && <SidebarToggler open={open} onClick={() => setOpen(!open)}>
            {open ? <FaChevronLeft className={"m-auto"}/> : <FaChevronRight className={"m-auto"}/>}
        </SidebarToggler>}
    </React.Fragment>
};

export default AdminSidebar;