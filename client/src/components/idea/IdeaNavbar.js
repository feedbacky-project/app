import {renderLogIn} from "components/commons/navbar-commons";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {NavbarBrand} from "react-bootstrap";
import {FaChevronLeft} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiContainer} from "ui/grid";
import {UiNavbar} from "ui/navbar";

const IdeaNavbar = () => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);

    return <UiNavbar>
        <Link to={{
            pathname: "/b/" + data.discriminator,
            state: {_boardData: data}
        }} className={"d-none d-md-block go-back-button hoverable-option justify-content-start"} style={{position: "absolute"}}>
            <FaChevronLeft className={"ml-2"}/>
        </Link>
        <UiContainer className={"d-flex"}>
            <NavbarBrand as={Link} to={{
                pathname: "/b/" + data.discriminator,
                state: {_boardData: data}
            }}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Logo"}/>
                <span>{data.name}</span>
            </NavbarBrand>
            <div className={"ml-auto py-0 text-nowrap"}>
                {renderLogIn(onNotLoggedClick, context)}
            </div>
        </UiContainer>
    </UiNavbar>
};

export default IdeaNavbar;