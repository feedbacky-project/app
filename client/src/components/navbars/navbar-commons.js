import {Dropdown, NavItem} from "react-bootstrap";
import {isServiceAdmin} from "components/util/utils";
import React from "react";
import {Link} from "react-router-dom";
import {FaCogs, FaSignInAlt, FaUserAlt} from "react-icons/fa";
import {FaAngleDown} from "react-icons/all";
import {PageAvatar} from "components/app/page-avatar";

export const renderLogIn = (onNotLoggedClick, context) => {
    if (!context.user.loggedIn) {
        return <NavItem>
            <a className="button btn active text-white shadow-none mx-0 z-depth-0 py-0" href="#!" onClick={onNotLoggedClick}><FaSignInAlt/></a>
        </NavItem>
    }
    return <NavItem>
        <Dropdown>
            <Dropdown.Toggle id="userOptions" variant="" className="btn btn-link m-0 pr-1 text-white">
                <PageAvatar className="mr-1" roundedCircle url={context.user.data.avatar} size={24} username={context.user.data.username}/>
                <FaAngleDown/>
            </Dropdown.Toggle>
            <Dropdown.Menu alignRight>
                <Dropdown.Item>
                    <FaUserAlt className="mr-2 move-top-1px"/>
                    <strong className="d-inline-block align-middle text-truncate" style={{maxWidth: 100}}>{context.user.data.username}</strong>
                </Dropdown.Item>
                <div className="my-1"/>
                <Dropdown.Item className="d-inline-block" onClick={context.onDarkModeToggle}>
                    {context.user.darkMode ? "🌔 Light Mode" : "🌘 Dark Mode"}
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/me">
                    View Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={context.user.onLogOut}>
                    Log Out
                </Dropdown.Item>
                {renderModeratedBoards(context)}
                <div className="my-1"/>
                {renderCreateBoardSection(context)}
            </Dropdown.Menu>
        </Dropdown>
    </NavItem>
};

const renderModeratedBoards = (context) => {
    if (context.user.data.permissions.length === 0) {
        return;
    }
    return <React.Fragment>
        <div className="my-1"/>
        <Dropdown.Item>
            <FaCogs className="mr-2 move-top-1px"/>
            <strong>Moderated Boards</strong>
        </Dropdown.Item>
        <div className="my-1"/>
        {context.user.data.permissions.map(data => {
            return <Dropdown.Item key={data.boardDiscriminator} as={Link} to={"/b/" + data.boardDiscriminator}>{data.boardName}</Dropdown.Item>
        })}
    </React.Fragment>
};

const renderCreateBoardSection = (context) => {
    if (!isServiceAdmin(context)) {
        return <React.Fragment/>
    }
    return <Dropdown.Item as={Link} to="/admin/create">
        <strong>Create Own Board</strong>
    </Dropdown.Item>
};