import {renderLogIn} from "components/commons/navbar-commons";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import UiContainer from "ui/grid/UiContainer";
import UiNavbar from "ui/navbar/UiNavbar";

const BoardNavbar = () => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);

    return <UiNavbar>
        <UiContainer className={"d-flex"}>
            <NavbarBrand as={Link} to={"/me"}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Logo"}/>
                <span>{data.name}</span>
            </NavbarBrand>
            <div className={"ml-auto py-0 text-nowrap"}>
                {renderLogIn(onNotLoggedClick, context)}
            </div>
        </UiContainer>
    </UiNavbar>
};

export default BoardNavbar;