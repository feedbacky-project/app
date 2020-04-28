import React, {useContext} from 'react';
import {Container, Nav, Navbar, NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "../../context/app-context";
import {getSizedAvatarByUrl} from "../util/utils";
import {renderLogIn} from "./navbar-commons";

const ProfileNavbar = (props) => {
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
                {renderHello(context)}
            </NavbarBrand>
            <Nav className="ml-auto py-0 text-nowrap">
                {renderLogIn(props.onNotLoggedClick, context)}
            </Nav>
        </Container>
    </Navbar>
};

const renderHello = (context) => {
    if (!context.user.loggedIn) {
        return <React.Fragment>
            <img className="img-responsive rounded mr-2" alt="avatar"
                 src={process.env.REACT_APP_DEFAULT_USER_AVATAR}
                 width={30} height={30}/>
            <span>Hello User</span>
        </React.Fragment>
    }
    return <React.Fragment>
        <img className="img-responsive rounded mr-2" alt="avatar"
             src={getSizedAvatarByUrl(context.user.data.avatar, 64)}
             onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}
             width={30} height={30}/>
        <span>Hello {context.user.data.username}</span>
    </React.Fragment>
};

export default ProfileNavbar;