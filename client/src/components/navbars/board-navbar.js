import React, {useContext} from 'react';
import {Container, NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";
import {renderLogIn} from "components/navbars/navbar-commons";
import PageNavbar from "components/navbars/page-navbar";

const BoardNavbar = (props) => {
    const context = useContext(AppContext);
    const theme = context.getTheme();

    return <PageNavbar theme={theme}>
        <Container className="d-flex">
            <NavbarBrand className="mr-0 text-truncate text-left flex-on" as={Link} to="/me">
                <img className="img-responsive mr-2" src={props.logoUrl}
                     height="30px"
                     width="30px" alt=""/>
                <span>{props.name}</span>
            </NavbarBrand>
            <div className="ml-auto py-0 text-nowrap">
                {renderLogIn(props.onNotLoggedClick, context)}
            </div>
        </Container>
    </PageNavbar>
};

export default BoardNavbar;