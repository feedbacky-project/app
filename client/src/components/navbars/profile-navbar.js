import React, {useContext} from 'react';
import {Container, NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";
import {getSizedAvatarByUrl} from "components/util/utils";
import {renderLogIn} from "components/navbars/navbar-commons";
import PageNavbar from "components/navbars/page-navbar";

const ProfileNavbar = (props) => {
    const context = useContext(AppContext);
    const theme = context.getTheme();

    return <PageNavbar theme={theme}>
        <Container className="d-flex">
            <NavbarBrand className="mr-0 text-truncate text-left flex-on" as={Link} to="/me">
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