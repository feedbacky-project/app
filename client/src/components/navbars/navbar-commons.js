import {Dropdown, DropdownItem, NavItem} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import {getSizedAvatarByUrl, isServiceAdmin} from "components/util/utils";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import React from "react";
import {Link} from "react-router-dom";
import {FaCogs, FaSignInAlt, FaUserAlt} from "react-icons/fa";
import {FaAngleDown} from "react-icons/all";

export const renderLogIn = (onNotLoggedClick, context) => {
    if (!context.user.loggedIn) {
        return <NavItem>
            <a className="button btn active text-white mx-0 z-depth-0 py-0" href="#!" onClick={onNotLoggedClick}><FaSignInAlt/></a>
        </NavItem>
    }
    return <NavItem>
        <Dropdown>
            <DropdownToggle id="userOptions" variant="" className="btn btn-link m-0 pr-1 text-white">
                <img className="img-responsive rounded mr-1"
                     src={getSizedAvatarByUrl(context.user.data.avatar, 64)}
                     onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}
                     alt="avatar" height="24px" width="24px"/>
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
            return <DropdownItem key={data.boardDiscriminator} as={Link} to={"/brdr/" + data.boardDiscriminator}>{data.boardName}</DropdownItem>
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