import React, {useContext, useEffect, useState} from "react";
import AppContext from "../../context/AppContext";
import LoginModal from "../../components/modal/LoginModal";
import ProfileNavbar from "../../components/navbars/ProfileNavbar";
import {Container, Row} from "react-bootstrap";
import {Route, Switch, useHistory} from "react-router-dom";
import SettingsView from "./subviews/SettingsView";
import ExploreView from "./subviews/ExploreView";
import {toastWarning} from "../../components/util/Utils";

const Profile = () => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const context = useContext(AppContext);
    const history = useHistory();
    const onNotLoggedClick = () => {
        setLoginModalOpen(true);
    };
    const reRouteTo = (destination) => {
        if(destination === "notifications") {
            toastWarning("Section not yet available.");
            return;
        }
        history.push({
            pathname: "/merdr/" + destination,
        });
    };

    useEffect(() => {
        context.onThemeChange("#343a40");
    }, []);

    return <React.Fragment>
        <LoginModal open={loginModalOpen} onLoginModalClose={() => setLoginModalOpen(false)}
                    image="https://cdn.feedbacky.net/static/img/login-logo.png"
                    boardName="Feedbacky" redirectUrl="me"/>
        <ProfileNavbar onNotLoggedClick={onNotLoggedClick}/>
        <Container>
            <Row className="justify-content-center pb-4">
                <Switch>
                    <Route path="/me/settings" render={() => <SettingsView reRouteTo={reRouteTo}/>}/>
                    <Route path="/me/explore" render={() => <ExploreView reRouteTo={reRouteTo}/>}/>
                    <Route render={() => <SettingsView reRouteTo={reRouteTo}/>}/>
                </Switch>
            </Row>
        </Container>
    </React.Fragment>
};

export default Profile;