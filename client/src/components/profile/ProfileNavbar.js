import {renderLogIn} from "components/commons/navbar-commons";
import PageNavbar from "components/commons/PageNavbar";
import {AppContext, BoardContext} from "context";
import React, {useContext} from 'react';
import {UiThemeContext} from "ui";
import {UiContainer} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiNavbar, UiNavbarBrand} from "ui/navbar";

const ProfileNavbar = ({onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const {user} = context;
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData} = useContext(BoardContext);
    const theme = getTheme(false);

    //neither null nor empty object
    if (boardData !== null && Object.keys(boardData).length !== 0) {
        return <PageNavbar goBackVisible/>;
    }
    const renderHello = () => {
        if (!user.loggedIn) {
            return <React.Fragment>
                <UiAvatar rounded className={"mr-2"} size={30} user={null}/>
                <span className={"align-middle"}>Hello Anonymous</span>
            </React.Fragment>
        }
        return <React.Fragment>
            <UiAvatar className={"mr-2"} roundedCircle user={user.data} size={30}/>
            <span className={"align-middle"}>Hello {user.data.username}</span>
        </React.Fragment>
    };
    return <UiNavbar theme={theme}>
        <UiContainer className={"d-flex"}>
            <UiNavbarBrand theme={getTheme().toString()} to={"/me"}>
                {renderHello(context)}
            </UiNavbarBrand>
            {renderLogIn(onNotLoggedClick, context, getTheme(), boardData)}
        </UiContainer>
    </UiNavbar>
};

export default ProfileNavbar;