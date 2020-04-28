import React, {useContext} from 'react';
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import NavbarBrand from "react-bootstrap/NavbarBrand";
import {Link} from "react-router-dom";
import {Nav} from "react-bootstrap";
import {renderLogIn} from "./navbar-commons";
import AppContext from "../../context/app-context";

const ErrorNavbar = (props) => {
    const context = useContext(AppContext);
    return <Navbar variant="light" expand="lg" className="navbar-no-shadow py-1 fixed-nav-index" style={{backgroundColor: "#202428", zIndex: 3}}>
        <Container className="d-flex">
            <NavbarBrand className="mr-0 text-truncate text-left flex-on" as={Link} to="/me">
                <img src="https://cdn.feedbacky.net/static/img/product-brand.png" height="30" className="" alt="Product Brand"/>
            </NavbarBrand>
            <Nav className="ml-auto py-0 text-nowrap">
                {renderLogIn(props.onNotLoggedClick, context)}
            </Nav>
        </Container>
    </Navbar>
};

export default ErrorNavbar;