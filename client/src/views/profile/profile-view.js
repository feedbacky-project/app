import React, {useContext, useEffect, useState} from "react";
import AppContext from "context/app-context";
import LoginModal from "components/modal/login-modal";
import ProfileNavbar from "components/navbars/profile-navbar";
import {Container, Row} from "react-bootstrap";
import {Route, Switch, useHistory} from "react-router-dom";
import SettingsSubview from "views/profile/subviews/settings-subview";
import ServiceLogo from "assets/img/service-logo.png";
import NotificationsSubview from "views/profile/subviews/notifications-subview";

const ProfileView = () => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const context = useContext(AppContext);
    const history = useHistory();
    const onNotLoggedClick = () => {
        setLoginModalOpen(true);
    };
    const reRouteTo = (destination) => {
        history.push({
            pathname: "/me/" + destination,
        });
    };

    useEffect(() => context.onThemeChange("#343a40"),
        // eslint-disable-next-line
        []);

    return <React.Fragment>
        <LoginModal open={loginModalOpen} onLoginModalClose={() => setLoginModalOpen(false)}
                    image={ServiceLogo} boardName={process.env.REACT_APP_SERVICE_NAME} redirectUrl="me"/>
        <ProfileNavbar onNotLoggedClick={onNotLoggedClick}/>
        <Container>
            <Row className="justify-content-center pb-4">
                <Switch>
                    <Route path="/me/settings" render={() => <SettingsSubview reRouteTo={reRouteTo}/>}/>
                    <Route path="/me/notifications" render={() => <NotificationsSubview reRouteTo={reRouteTo}/>}/>
                    <Route render={() => <SettingsSubview reRouteTo={reRouteTo}/>}/>
                </Switch>
            </Row>
        </Container>
    </React.Fragment>
};

export default ProfileView;