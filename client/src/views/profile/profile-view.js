import React, {lazy, Suspense, useContext, useEffect, useState} from "react";
import AppContext from "context/app-context";
import LoginModal from "components/modal/login-modal";
import ProfileNavbar from "components/navbars/profile-navbar";
import {Col, Container, Row} from "react-bootstrap";
import {Route, Switch, useHistory} from "react-router-dom";
import ServiceLogo from "assets/img/service-logo.png";
import ProfileSidebar from "../../components/sidebar/profile-sidebar";
import PageNodesContext from "../../context/page-nodes-context";
import LoadingSpinner from "../../components/util/loading-spinner";
import {retry} from "../../components/util/lazy-init";

const SettingsSubview = lazy(() => retry(() => import("views/profile/subviews/settings-subview")));
const NotificationsSubview = lazy(() => retry(() => import("views/profile/subviews/notifications-subview")));

const ProfileView = () => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [currentNode, setCurrentNode] = useState("settings");
    const context = useContext(AppContext);
    const history = useHistory();

    useEffect(() => context.onThemeChange("#343a40"),
        // eslint-disable-next-line
        []);

    return <PageNodesContext.Provider value={{setCurrentNode: setCurrentNode}}>
        <LoginModal open={loginModalOpen} onLoginModalClose={() => setLoginModalOpen(false)}
                    image={ServiceLogo} boardName={process.env.REACT_APP_SERVICE_NAME} redirectUrl="me"/>
        <ProfileNavbar onNotLoggedClick={() => setLoginModalOpen(true)}/>
        <Container>
            <Row className="justify-content-center pb-4">
                <ProfileSidebar currentNode={currentNode} reRouteTo={(destination) => history.push({pathname: "/me/" + destination})}/>
                <Suspense fallback={<Col xs={12} md={9}><Row className="justify-content-center vertical-center"><LoadingSpinner/></Row></Col>}>
                    <Switch>
                        <Route path="/me/settings" component={SettingsSubview}/>
                        <Route path="/me/notifications" component={NotificationsSubview}/>
                        <Route component={SettingsSubview}/>
                    </Switch>
                </Suspense>
            </Row>
        </Container>
    </PageNodesContext.Provider>
};

export default ProfileView;