import React, {useContext} from 'react';
import Container from "react-bootstrap/Container";
import NavbarBrand from "react-bootstrap/NavbarBrand";
import {Link} from "react-router-dom";
import {Nav} from "react-bootstrap";
import {renderLogIn} from "components/navbars/navbar-commons";
import AppContext from "context/app-context";
import PageNavbar from "components/navbars/page-navbar";

const ErrorNavbar = (props) => {
    const context = useContext(AppContext);

    return <PageNavbar theme={"#202428"}>
        <Container className="d-flex">
            <NavbarBrand className="mr-0 text-truncate text-left flex-on" as={Link} to="/me">
                Oops, unexpected issue!
            </NavbarBrand>
            <Nav className="ml-auto py-0 text-nowrap">
                {renderLogIn(props.onNotLoggedClick, context)}
            </Nav>
        </Container>
    </PageNavbar>
};

export default ErrorNavbar;