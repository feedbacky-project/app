import {renderLogIn} from "components/commons/navbar-commons";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {UiContainer} from "ui/grid";
import {UiNavbar, UiNavbarBrand} from "ui/navbar";

const BoardNavbar = () => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);

    return <UiNavbar>
        <UiContainer className={"d-flex"}>
            <UiNavbarBrand to={"/me"}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Logo"}/>
                <span>{data.name}</span>
            </UiNavbarBrand>
            {renderLogIn(onNotLoggedClick, context)}
        </UiContainer>
    </UiNavbar>
};

export default BoardNavbar;