import {renderLogIn} from "components/commons/navbar-commons";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {FaChevronLeft} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiContainer} from "ui/grid";
import {UiNavbar, UiNavbarBrand} from "ui/navbar";

const IdeaNavbar = () => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);

    return <UiNavbar>
        <Link to={{
            pathname: "/b/" + data.discriminator,
            state: {_boardData: data}
        }} className={"d-none d-md-block go-back-button hoverable-option justify-content-start ml-3"} style={{position: "absolute"}}>
            <FaChevronLeft className={"ml-2"}/>
        </Link>
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