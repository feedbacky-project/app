import React, {useContext} from 'react';
import {Container, NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";
import {renderLogIn} from "components/navbars/navbar-commons";
import PageNavbar from "components/navbars/page-navbar";
import {PageAvatar} from "components/app/page-avatar";
import {getDefaultAvatar} from "components/util/utils";

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
            <img className="rounded mr-2" alt="avatar"
                 src={getDefaultAvatar("User")}
                 width={30} height={30}/>
            <span>Hello User</span>
        </React.Fragment>
    }
    return <React.Fragment>
        <PageAvatar className="mr-2" roundedCircle url={context.user.data.avatar} size={30} username={context.user.data.username}/>
        <span>Hello {context.user.data.username}</span>
    </React.Fragment>
};

export default ProfileNavbar;