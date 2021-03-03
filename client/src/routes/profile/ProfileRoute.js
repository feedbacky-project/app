import ServiceLogo from "assets/img/service-logo.png";
import LoginModal from "components/LoginModal";
import ProfileNavbar from "components/profile/ProfileNavbar";
import ProfileSidebar from "components/profile/ProfileSidebar";
import AppContext from "context/AppContext";
import PageNodesContext from "context/PageNodesContext";
import React, {lazy, Suspense, useContext, useEffect, useState} from "react";
import {Route, Switch, useHistory} from "react-router-dom";
import {UiLoadingSpinner} from "ui";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {getEnvVar} from "utils/env-vars";
import {retry} from "utils/lazy-init";

const SettingsSubroute = lazy(() => retry(() => import("routes/profile/subroutes/SettingsSubroute")));
const AppearanceSubroute = lazy(() => retry(() => import("routes/profile/subroutes/AppearanceSubroute")));
const NotificationsSubroute = lazy(() => retry(() => import("routes/profile/subroutes/NotificationsSubroute")));

const ProfileRoute = () => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [currentNode, setCurrentNode] = useState("settings");
    const {onThemeChange} = useContext(AppContext);
    const history = useHistory();
    useEffect(() => onThemeChange(), [onThemeChange]);
    return <PageNodesContext.Provider value={{setCurrentNode: setCurrentNode}}>
        <LoginModal isOpen={loginModalOpen} onHide={() => setLoginModalOpen(false)}
                    image={ServiceLogo} boardName={getEnvVar("REACT_APP_SERVICE_NAME")} redirectUrl={"me"}/>
        <ProfileNavbar onNotLoggedClick={() => setLoginModalOpen(true)}/>
        <UiContainer>
            <UiRow centered className={"pb-5"}>
                <ProfileSidebar currentNode={currentNode} reRouteTo={destination => history.push({pathname: "/me/" + destination})}/>
                <Suspense fallback={<UiCol xs={12} md={9}><UiRow centered className={"mt-5 pt-5"}><UiLoadingSpinner/></UiRow></UiCol>}>
                    <Switch>
                        <Route path={"/me/settings"} component={SettingsSubroute}/>
                        <Route path={"/me/appearance"} component={AppearanceSubroute}/>
                        <Route path={"/me/notifications"} component={NotificationsSubroute}/>
                        <Route component={SettingsSubroute}/>
                    </Switch>
                </Suspense>
            </UiRow>
        </UiContainer>
    </PageNodesContext.Provider>
};

export default ProfileRoute;