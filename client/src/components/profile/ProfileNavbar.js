import {renderLogIn} from "components/commons/navbar-commons";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {NavbarBrand} from "react-bootstrap";
import {Link} from "react-router-dom";
import UiContainer from "ui/grid/UiContainer";
import UiNavbar from "ui/navbar/UiNavbar";
import UiAvatar from "ui/image/UiAvatar";

const ProfileNavbar = ({onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const {user, getTheme} = context;
    const theme = getTheme(false);
    const renderHello = () => {
        if (!user.loggedIn) {
            return <React.Fragment>
                <UiAvatar rounded className={"mr-2"} size={30} user={null}/>
                Hello Anonymous
            </React.Fragment>
        }
        return <React.Fragment>
            <UiAvatar className={"mr-2"} roundedCircle user={user.data} size={30}/>
            Hello {user.data.username}
        </React.Fragment>
    };

    return <UiNavbar theme={theme}>
        <UiContainer className={"d-flex"}>
            <NavbarBrand as={Link} to={"/me"}>
                {renderHello(context)}
            </NavbarBrand>
            <div className={"ml-auto py-0 text-nowrap"}>
                {renderLogIn(onNotLoggedClick, context)}
            </div>
        </UiContainer>
    </UiNavbar>
};

export default ProfileNavbar;