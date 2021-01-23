import React, {useContext} from 'react';
import {Container, NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";
import {renderLogIn} from "components/navbars/navbar-commons";
import PageNavbar from "components/navbars/page-navbar";
import PageAvatar from "components/app/page-avatar";

const ProfileNavbar = (props) => {
    const context = useContext(AppContext);
    const theme = context.getTheme(false);

    return <PageNavbar theme={theme}>
        <Container className="d-flex">
            <NavbarBrand as={Link} to="/me">
                {renderHello(context)}
            </NavbarBrand>
            <div className="ml-auto py-0 text-nowrap">
                {renderLogIn(props.onNotLoggedClick, context)}
            </div>
        </Container>
    </PageNavbar>
};

const renderHello = (context) => {
    if (!context.user.loggedIn) {
        return <React.Fragment>
            <PageAvatar rounded className="mr-2" size={30} user={null}/>
            <span>Hello Anonymous</span>
        </React.Fragment>
    }
    return <React.Fragment>
        <PageAvatar className="mr-2" roundedCircle user={context.user.data} size={30}/>
        <span>Hello {context.user.data.username}</span>
    </React.Fragment>
};

export default ProfileNavbar;