import styled from "@emotion/styled";
import {renderLogIn} from "components/commons/navbar-commons";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {FaRegComment, FaRegMap} from "react-icons/all";
import {UiContainer} from "ui/grid";
import {UiNavbar, UiNavbarBrand, UiNavbarOption, UiNavbarSelectedOption} from "ui/navbar";

const Hoverable = styled.div`
  transition: var(--hover-transition);
  &:hover, &:focus {
    transform: var(--hover-transform-scale-sm);
  }
`;

const BoardNavbar = () => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);

    return <UiNavbar>
        <UiContainer className={"d-flex"}>
            <UiNavbarBrand theme={context.getTheme().toString()} to={"/me"}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Logo"}/>
                <span className={"align-bottom"}>{data.name}</span>
            </UiNavbarBrand>
            <div className={"d-flex"} style={{fontWeight: "500"}}>
                <UiNavbarSelectedOption to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}}
                                        theme={context.getTheme()} border={context.getTheme().setAlpha(.75)} aria-label={"Feedback"}>
                    <Hoverable>
                        <FaRegComment className={"mr-2"}/>
                        <span className={"d-sm-inline-block d-none align-middle"}>Feedback</span>
                    </Hoverable>
                </UiNavbarSelectedOption>
                <UiNavbarOption to={{pathname: "/b/" + data.discriminator + "/roadmap", state: {_boardData: data}}}
                                theme={context.getTheme()} aria-label={"Roadmap"}>
                    <FaRegMap className={"mr-2"}/>
                    <span className={"d-sm-inline-block d-none align-middle"}>Roadmap</span>
                </UiNavbarOption>
            </div>
            {renderLogIn(onNotLoggedClick, context)}
        </UiContainer>
    </UiNavbar>
};

export default BoardNavbar;