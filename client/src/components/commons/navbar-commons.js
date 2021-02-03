import styled from "@emotion/styled";
import React from "react";
import {FaAngleDown, FaUserCog} from "react-icons/all";
import {FaCogs, FaSignInAlt, FaUserAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";
import {UiAvatar} from "ui/image";
import {isServiceAdmin} from "utils/basic-utils";

export const UiNavbarBrand = styled(Link)`
  color: white;
  flex: 1;
  margin-right: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 1.25rem;
  display: inline-block;
  padding: .25rem 0;
  &:hover {
    color: white;
  }
`;

const LoginButton = styled.div`
  padding: 0 .75rem;
  color: white;
  transition: var(--hover-transition);
  cursor: pointer;
  
  &:hover {
    color: white;
    transform: scale(1.2);
  }
`;

export const renderLogIn = (onNotLoggedClick, context) => {
    if (!context.user.loggedIn) {
        return <LoginButton onClick={onNotLoggedClick}><FaSignInAlt/></LoginButton>
    }
    return <UiDropdown toggleClassName={"btn btn-link pr-1 text-white"} toggle={
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
        <FaUserCog className={"mr-2 move-top-1px"}/>
        <strong>Create New Board</strong>
    </UiDropdownElement>
};