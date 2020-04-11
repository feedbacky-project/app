import {Dropdown, DropdownItem, NavItem} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import {getSizedAvatarByUrl, isServiceAdmin} from "../util/Utils";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import React from "react";
import {Link} from "react-router-dom";
import {FaCogs, FaSignInAlt, FaUserAlt} from "react-icons/fa";

export const renderLogIn = (onNotLoggedClick, context) => {
    if (!context.user.loggedIn) {
        return <NavItem>
            <a className="button btn active text-white mx-0 z-depth-0 py-0" href="#!"
               onClick={onNotLoggedClick}><FaSignInAlt/></a>
        </NavItem>
    }
    return <NavItem>
        <Dropdown>
            <DropdownToggle id="userOptions" variant="" className="btn btn-link m-0 pr-1 text-white">
                <img className="img-responsive rounded mr-1"
                     src={getSizedAvatarByUrl(context.user.data.avatar, 64)}
                     onError={(e) => e.target.src = "https://cdn.feedbacky.net/static/img/default_avatar.png"}
                     alt="avatar"
                     height="24px" width="24px"/>
            </DropdownToggle>
            <DropdownMenu alignRight>
                <DropdownItem className="rounded px-2">
                    <FaUserAlt className="fa-sm mr-2"/>
                    <strong className="d-inline-block align-middle text-truncate" style={{maxWidth: 100, fontWeight: 500}}>{context.user.data.username}</strong>
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
    if (context.user.moderates.length === 0) {
        return;
    }
    return <React.Fragment>
        <div className="my-1"/>
        <DropdownItem className="px-2">
            <FaCogs className="fa-sm mr-2"/>
            <strong style={{fontWeight: 500}}>Moderated Boards</strong>
        </DropdownItem>
        <div className="my-1"/>
        {context.user.moderates.map(data => {
            return <DropdownItem key={"moderated_" + data.boardDiscriminator} as={Link} to={"/brdr/" + data.boardDiscriminator}>{data.boardName}</DropdownItem>
        })}
    </React.Fragment>
};

const renderCreateBoardSection = (context) => {
    if(!isServiceAdmin(context)) {
        return <React.Fragment/>
    }
    return <DropdownItem as={Link} to="/admin/create" style={{fontWeight: 500}}>
        Create Own Board
    </DropdownItem>
};