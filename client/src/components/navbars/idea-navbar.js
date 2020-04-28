import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {Container, Nav, Navbar, NavbarBrand} from "react-bootstrap";
import AppContext from "../../context/app-context";
import {renderLogIn} from "./navbar-commons";

const IdeaNavbar = (props) => {
    const context = useContext(AppContext);
    const styles = {
        zIndex: 3,
        //darken
        backgroundColor: context.user.darkMode ? context.theme + "D9" : context.theme,
    };

    return <Navbar variant="dark" style={styles} expand="lg"
                   className="py-1 fixed-nav-index">
        <Link to={{
            pathname: "/b/" + props.discriminator,
            state: {_boardData: props.boardData, _moderators: props.moderators}
        }} className="d-none d-md-block go-back-button justify-content-start" style={{position: "absolute"}}>
            <FaChevronLeft className="ml-2"/>
        </Link>
        <Container className="d-flex">
            <NavbarBrand className="mr-0 text-truncate text-left flex-on" as={Link} to={{
                pathname: "/b/" + props.discriminator,
                state: {_boardData: props.boardData, _moderators: props.moderators}
            }}>
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

export default IdeaNavbar;