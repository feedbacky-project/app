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
  margin-top: .5rem;
  justify-content: start;
  transition: var(--hover-transition);
  color: ${props => props.theme};
  
  &:hover {
    transform: var(--hover-transform-scale-lg);
    color: ${props => props.theme};
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
        <GoBackButton theme={context.getTheme().toString()} to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}} aria-label={"Go Back"}>
            <FaChevronLeft className={"ml-2"}/>
        </GoBackButton>
        <UiContainer className={"d-flex"}>
            <UiNavbarBrand theme={context.getTheme().toString()} to={{
                pathname: "/b/" + data.discriminator,
                state: {_boardData: data}
            }}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Board Logo"}/>
                <span className={"align-bottom"}>{data.name}</span>
            </UiNavbarBrand>
            {renderLogIn(onNotLoggedClick, context)}
        </UiContainer>
    </UiNavbar>
};

export default IdeaNavbar;