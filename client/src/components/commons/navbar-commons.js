import styled from "@emotion/styled";
import React from "react";
import {FaAngleDown, FaUserCog} from "react-icons/all";
import {FaCogs, FaSignInAlt, FaUserAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiClassicButton} from "ui/button";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";
import {UiAvatar} from "ui/image";
import {isServiceAdmin} from "utils/basic-utils";

const LoginButton = styled(UiClassicButton)`
  padding: 0 .8rem;
  color: var(--font-color);
  background-color: transparent !important;
  transition: var(--hover-transition);
  cursor: pointer;
  box-shadow: none;
  font-size: .9rem;
  margin: .5rem 0;
  
  &:hover, &:focus {
    color: var(--font-color);
    box-shadow: none;
    background-color: transparent !important;
    transform: var(--hover-transform-scale-sm);
  }
  
  .dark & {
    color: var(--dark-font-color);
  }
`;

const OptionsButton = styled.div`
  background-color: transparent;
  padding: 0;
  box-shadow: none;
  color: white;
  line-height: 1.65rem;
  
  &:hover, &:focus {
    color: white;
    background-color: transparent;
    box-shadow: none;
  }
`;

const TopDropdownElement = styled(UiDropdownElement)`
  padding-top: .4rem;
  border-top: 2px solid ${props => props.theme};
`;

export const renderLogIn = (onNotLoggedClick, context) => {
    if (!context.user.loggedIn) {
        return <LoginButton label={"Log-in"} onClick={onNotLoggedClick}><FaSignInAlt/> Log In</LoginButton>
    }
    return <UiDropdown label={"Options"} toggleClassName={"px-0"} menuClassName={"pt-0 rounded-top-0"} toggle={
        <OptionsButton>
            <UiAvatar className={"mr-1"} roundedCircle user={context.user.data} size={28} style={{border: "1px solid " + context.getTheme()}}/>
            <FaAngleDown color={context.getTheme()}/>
        </OptionsButton>
    }>
        <TopDropdownElement theme={context.getTheme().setAlpha(.75).toString()}>
            <FaUserAlt className={"mr-2 move-top-1px"}/>
            <strong className={"d-inline-block align-middle text-truncate"} style={{maxWidth: 100}}>{context.user.data.username}</strong>
        </TopDropdownElement>
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