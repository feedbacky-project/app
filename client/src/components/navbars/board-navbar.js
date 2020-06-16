import React, {useContext} from 'react';
import {Container, NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";
import {renderLogIn} from "components/navbars/navbar-commons";
import PageNavbar from "components/navbars/page-navbar";
import BoardContext from "context/board-context";

const BoardNavbar = ({onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const boardContext = useContext(BoardContext);
    const theme = context.getTheme();

    return <PageNavbar theme={theme}>
        <Container className="d-flex">
            <NavbarBrand as={Link} to="/me">
                <img className="mr-2" src={boardContext.data.logo}
                     height="30px"
                     width="30px" alt=""/>
                <span>{boardContext.data.name}</span>
            </NavbarBrand>
            <div className="ml-auto py-0 text-nowrap">
                {renderLogIn(onNotLoggedClick, context)}
            </div>
        </Container>
    </PageNavbar>
};

export default BoardNavbar;