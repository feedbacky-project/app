import {Dropdown, DropdownItem, NavItem} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import {isServiceAdmin} from "components/util/utils";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import React from "react";
import {Link} from "react-router-dom";
import {FaCogs, FaSignInAlt, FaUserAlt} from "react-icons/fa";
import {FaAngleDown} from "react-icons/all";
import {PageAvatar} from "components/app/page-avatar";

export const renderLogIn = (onNotLoggedClick, context) => {
    if (!context.user.loggedIn) {
        return <NavItem>
            <a className="button btn active text-white mx-0 z-depth-0 py-0" href="#!" onClick={onNotLoggedClick}><FaSignInAlt/></a>
        </NavItem>
    }
    return <NavItem>
        <Dropdown>
            <DropdownToggle id="userOptions" variant="" className="btn btn-link m-0 pr-1 text-white">
                <PageAvatar className="mr-1" circle url={context.user.data.avatar} size={24}/>
                <FaAngleDown/>
            </DropdownToggle>
            <DropdownMenu alignRight>
                <DropdownItem>
                    <FaUserAlt className="mr-2 move-top-1px"/>
                    <strong className="d-inline-block align-middle text-truncate" style={{maxWidth: 100}}>{context.user.data.username}</strong>
                </DropdownItem>
                <div className="my-1"/>
                <DropdownItem className="d-inline-block" onClick={context.onDarkModeToggle}>
                    {context.user.darkMode ? "🌔 Light Mode" : "🌘 Dark Mode"}
                </DropdownItem>
                <DropdownItem as={Link} to="/me">
                    View Profile
                </DropdownItem>
                <DropdownItem onClick={context.user.onLogOut}>
                    Log Out
                </DropdownItem>
                {renderModeratedBoards(context)}
                <div className="my-1"/>
                {renderCreateBoardSection(context)}
            </DropdownMenu>
        </Dropdown>
    </NavItem>
};

const renderModeratedBoards = (context) => {
    if (context.user.data.permissions.length === 0) {
        return;
    }
    return <React.Fragment>
        <div className="my-1"/>
        <DropdownItem>
            <FaCogs className="mr-2 move-top-1px"/>
            <strong>Moderated Boards</strong>
        </DropdownItem>
        <div className="my-1"/>
        {context.user.data.permissions.map(data => {
            return <DropdownItem key={data.boardDiscriminator} as={Link} to={"/b/" + data.boardDiscriminator}>{data.boardName}</DropdownItem>
        })}
    </React.Fragment>
};

const renderCreateBoardSection = (context) => {
    if (!isServiceAdmin(context)) {
        return <React.Fragment/>
    }
    return <DropdownItem as={Link} to="/admin/create">
        <strong>Create Own Board</strong>
    </DropdownItem>
};