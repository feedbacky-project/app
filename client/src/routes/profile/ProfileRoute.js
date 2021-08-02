import ServiceLogo from "assets/img/service-logo.png";
import LoginModal from "components/LoginModal";
import ProfileNavbar from "components/profile/ProfileNavbar";
import ProfileSidebar from "components/profile/ProfileSidebar";
import {AppContext, PageNodesContext} from "context";
import React, {lazy, Suspense, useContext, useEffect, useState} from "react";
import {FaExclamationCircle} from "react-icons/all";
import {Route, Switch, useHistory, useLocation} from "react-router-dom";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
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
    const history = useHistory();
    const location = useLocation();
    const getPassedBoardData = () => {
      if(location.state == null) {
          return null;
      }
      return location.state._boardData;
    };
    const [board, setBoard] = useState({data: getPassedBoardData(), loaded: true, error: false});
    const {onThemeChange} = useContext(AppContext);
    useEffect(() => {
        const data = getPassedBoardData();
        if(data !== null) {
            onThemeChange(data.themeColor);
            return;
        }
        onThemeChange();
    }, []);
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={() => setLoginModalOpen(true)}
                                    errorMessage={"Content Not Found"} errorIcon={FaExclamationCircle}>
        <PageNodesContext.Provider value={{setCurrentNode: setCurrentNode}}>
            <LoginModal isOpen={loginModalOpen} onHide={() => setLoginModalOpen(false)}
                        image={ServiceLogo} boardName={getEnvVar("REACT_APP_SERVICE_NAME")} redirectUrl={"me"}/>
            <ProfileNavbar onNotLoggedClick={() => setLoginModalOpen(true)}/>
            <UiContainer>
                <UiRow centered className={"pb-5"}>
                    <ProfileSidebar currentNode={currentNode} reRouteTo={destination => history.push({pathname: "/me/" + destination, state: {_boardData: getPassedBoardData()}})}/>
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
    </BoardContextedRouteUtil>
};

export default ProfileRoute;
