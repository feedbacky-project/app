import styled from "@emotion/styled";
import {renderLogIn} from "components/commons/navbar-commons";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {FaChevronLeft} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiContainer} from "ui/grid";
import {UiNavbar, UiNavbarBrand} from "ui/navbar";

const GoBackButton = styled(Link)`
  position: absolute;
  margin-left: .75rem;
  justify-content: start;
  transition: var(--hover-transition);
  color: white;
  
  &:hover {
    transform: scale(1.2);
    color: white;
    text-decoration: none;
  }
  
  @media(max-width: 768px) {
    display: none;
  }  
`;

const IdeaNavbar = () => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);

    return <UiNavbar>
        <GoBackButton to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}}><FaChevronLeft className={"ml-2"}/></GoBackButton>
        <UiContainer className={"d-flex"}>
            <UiNavbarBrand to={{
                pathname: "/b/" + data.discriminator,
                state: {_boardData: data}
            }}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Logo"}/>
                <span>{data.name}</span>
            </UiNavbarBrand>
            {renderLogIn(onNotLoggedClick, context)}
        </UiContainer>
    </UiNavbar>
};

export default IdeaNavbar;