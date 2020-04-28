import React, {useContext} from 'react';
import {Container, Nav, Navbar, NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "../../context/AppContext";
import {renderLogIn} from "./NavbarCommons";

const BoardNavbar = (props) => {
    const context = useContext(AppContext);
    const styles = {
        zIndex: 3,
        //darken
        backgroundColor: context.user.darkMode ? context.theme + "D9" : context.theme,
    };

    return <Navbar variant="dark" style={styles} expand="lg"
                   className="py-1 fixed-nav-index">
        <Container className="d-flex">
            <NavbarBrand className="mr-0 text-truncate text-left flex-on" as={Link} to="/me">
                <img className="img-responsive mr-2" src={props.logoUrl}
                     height="30px"
                     width="30px" alt=""/>
                <span>{props.name}</span>
            </NavbarBrand>
            <Nav className="ml-auto py-0 text-nowrap">
                {renderLogIn(props.onNotLoggedClick, context)}
            </Nav>
        </Container>
    </Navbar>
};

export default BoardNavbar;