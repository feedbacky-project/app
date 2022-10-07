import styled from "@emotion/styled";
import React from "react";
import {FaAngleDown, FaCogs, FaSignInAlt, FaUserAlt, FaUserCog} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiButton} from "ui/button";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";
import {UiAvatar} from "ui/image";
import {isServiceAdmin} from "utils/basic-utils";

const LoginButton = styled(UiButton)`
  padding: .25rem .5rem;
  transition: var(--hover-transition);
  cursor: pointer;
  box-shadow: none;
  font-size: .9rem;
  margin: .25rem 0 .25rem .25rem;
  border: 1px dashed ${props => props.theme}
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

const Username = styled.strong`
  display: inline-block;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
`;

export const renderLogIn = (onNotLoggedClick, context, theme, boardData = null) => {
    if (!context.user.loggedIn) {
        return <LoginButton theme={theme.setAlpha(.2).toString()} className={"d-inline-block float-right order-sm-2 order-1"} label={"Log-in"} onClick={onNotLoggedClick}><FaSignInAlt/> Log In</LoginButton>
    }
    return <UiDropdown className={"d-inline-block float-right order-sm-2 order-1"} label={"Options"} toggleClassName={"px-0"} menuClassName={"pt-0 rounded-top-0"} toggle={
        <OptionsButton>
            <UiAvatar className={"mx-1"} roundedCircle user={context.user.data} size={28} style={{border: "1px solid " + theme}}/>
            <FaAngleDown color={theme}/>
        </OptionsButton>
    }>
        <TopDropdownElement theme={theme.setAlpha(.75).toString()}>
            <FaUserAlt className={"mr-2 move-top-1px"}/>
            <Username>{context.user.data.username}</Username>
        </TopDropdownElement>
        <div className={"my-1"}/>
        <UiDropdownElement as={Link} to={{pathname: "/me", state: {_boardData: boardData}}}>
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
    return <UiDropdownElement as={Link} to={"/create"}>
        <FaUserCog className={"mr-2 move-top-1px"}/>
        <strong>Create New Board</strong>
    </UiDropdownElement>
};