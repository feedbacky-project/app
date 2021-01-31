import React from "react";
import {NavItem} from "react-bootstrap";
import {FaAngleDown} from "react-icons/all";
import {FaCogs, FaSignInAlt, FaUserAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";
import {UiAvatar} from "ui/image";
import {isServiceAdmin} from "utils/basic-utils";

export const renderLogIn = (onNotLoggedClick, context) => {
    if (!context.user.loggedIn) {
        return <NavItem>
            <a className={"button btn active text-white shadow-none mx-0 z-depth-0 py-0"} href={"#!"} onClick={onNotLoggedClick}><FaSignInAlt/></a>
        </NavItem>
    }
    return <NavItem>
        <UiDropdown toggleClassName={"btn btn-link m-0 pr-1 text-white"} toggle={
            <React.Fragment>
                <UiAvatar className={"mr-1"} roundedCircle user={context.user.data} size={24}/>
                <FaAngleDown/>
            </React.Fragment>
        }>
            <UiDropdownElement>
                <FaUserAlt className={"mr-2 move-top-1px"}/>
                <strong className={"d-inline-block align-middle text-truncate"} style={{maxWidth: 100}}>{context.user.data.username}</strong>
            </UiDropdownElement>
            <div className={"my-1"}/>
            <UiDropdownElement as={Link} to={"/me"}>
                Settings
            </UiDropdownElement>
            <UiDropdownElement onClick={context.user.onLogOut}>
                Log Out
            </UiDropdownElement>
            {renderModeratedBoards(context)}
            <div className={"my-1"}/>
            {renderCreateBoardSection(context)}
        </UiDropdown>
    </NavItem>
};

const renderModeratedBoards = (context) => {
    if (context.user.data.permissions.length === 0) {
        return;
    }
    return <React.Fragment>
        <div className={"my-1"}/>
        <UiDropdownElement>
            <FaCogs className={"mr-2 move-top-1px"}/>
            <strong>Moderated Boards</strong>
        </UiDropdownElement>
        <div className={"my-1"}/>
        {context.user.data.permissions.map(data => {
            return <UiDropdownElement key={data.boardDiscriminator} as={Link} to={"/b/" + data.boardDiscriminator}>{data.boardName}</UiDropdownElement>
        })}
    </React.Fragment>
};

const renderCreateBoardSection = (context) => {
    if (!isServiceAdmin(context)) {
        return <React.Fragment/>
    }
    return <UiDropdownElement as={Link} to={"/admin/create"}>
        <strong>Create Own Board</strong>
    </UiDropdownElement>
};