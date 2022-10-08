import axios from "axios";
import AdminSidebar from "components/board/admin/AdminSidebar";
import PageNavbar from "components/commons/PageNavbar";
import {AppContext, PageNodesContext} from "context";
import React, {lazy, Suspense, useContext, useEffect, useState} from 'react';
import {FaExclamationCircle} from "react-icons/fa";
import {Route, Switch, useHistory, useLocation, useParams} from "react-router-dom";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {UiLoadingSpinner, UiThemeContext} from "ui";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {retry} from "utils/lazy-init";

const GeneralSettings = lazy(() => retry(() => import("routes/board/admin/subroutes/GeneralSubroute")));
const TagsSettings = lazy(() => retry(() => import("routes/board/admin/subroutes/TagsSubroute")));
const ModeratorsSettings = lazy(() => retry(() => import("routes/board/admin/subroutes/ModeratorsSubroute")));
const WebhooksSettings = lazy(() => retry(() => import("routes/board/admin/subroutes/webhooks/WebhooksSubroute")));
const CreateWebhook = lazy(() => retry(() => import("routes/board/admin/subroutes/webhooks/creator/CreateWebhookSubroute")));
const SocialLinksSettings = lazy(() => retry(() => import("routes/board/admin/subroutes/social/SocialLinksSubroute")));
const CreateSocialLink = lazy(() => retry(() => import("routes/board/admin/subroutes/social/creator/CreateSocialLinkSubroute")));
const SuspensionSettings = lazy(() => retry(() => import("routes/board/admin/subroutes/SuspensionsSubroute")));
const IntegrationsSettings = lazy(() => retry(() => import("routes/board/admin/subroutes/IntegrationsSubroute")));

const BoardAdminPanelRoute = () => {
    const {user, subdomain} = useContext(AppContext);
    const {onThemeChange} = useContext(UiThemeContext);
    const location = useLocation();
    const history = useHistory();
    const [currentNode, setCurrentNode] = useState("general");
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    useEffect(() => {
        if (location.state == null) {
            axios.get("/boards/" + subdomain).then(res => {
                if (res.status !== 200) {
                    setBoard({...board, error: true});
                }
                const data = res.data;
                setBoard({...board, data, loaded: true});
                onThemeChange(data.themeColor);
            }).catch(() => setBoard({...board, error: true}));
        } else {
            resolvePassedData();
        }
        // eslint-disable-next-line
    }, []);

    const resolvePassedData = () => {
        const state = location.state;
        setBoard({...board, data: state._boardData, loaded: true});
        onThemeChange(state._boardData.themeColor);
    };
    if (location.state != null && !board.loaded) {
        return <LoadingRouteUtil/>
    }
    const canView = () => {
        if (!user.loggedIn) {
            return false;
        }
        if (!board.loaded) {
            return true;
        }
        if (board.data.creatorId === user.data.id || board.data.moderators.find(mod => mod.userId === user.data.id && mod.role === "ADMINISTRATOR")) {
            return true;
        }
        return false;
    };
    if (!canView()) {
        history.push("/");
        return <React.Fragment/>
    }
    const onWarn = () => console.warn("BoardAdminPanelRoute invalid onNotLoggedClick call");
    const onReRoute = route => history.push({pathname: "/admin/" + route, state: {_boardData: board.data}})
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={onWarn} errorMessage={"Content Not Found"} errorIcon={FaExclamationCircle}>
        <PageNodesContext.Provider value={{setCurrentNode: setCurrentNode}}>
            <AdminSidebar currentNode={currentNode} reRouteTo={onReRoute} data={board}>
                <PageNavbar selectedNode={"admin"} goBackVisible/>
                <UiContainer>
                    <UiRow centered className={"pb-5"}>
                        <Suspense fallback={<UiCol xs={12}><UiRow centered className={"mt-5 pt-5"}><UiLoadingSpinner/></UiRow></UiCol>}>
                            <Switch>
                                <Route path={"/admin/tags"} component={TagsSettings}/>
                                <Route path={"/admin/moderators"} component={ModeratorsSettings}/>
                                <Route path={"/admin/webhooks/create"} component={CreateWebhook}/>
                                <Route path={"/admin/webhooks"} component={WebhooksSettings}/>
                                <Route path={"/admin/social/create"} component={CreateSocialLink}/>
                                <Route path={"/admin/social"} component={SocialLinksSettings}/>
                                <Route path={"/admin/suspended"} component={SuspensionSettings}/>
                                <Route path={"/admin/integrations"} component={IntegrationsSettings}/>
                                <Route path={"/admin/general"} render={() => <GeneralSettings updateState={data => setBoard({...board, data})}/>}/>
                                <Route render={() => <GeneralSettings updateState={data => setBoard({...board, data})}/>}/>
                            </Switch>
                        </Suspense>
                    </UiRow>
                </UiContainer>
            </AdminSidebar>
        </PageNodesContext.Provider>
    </BoardContextedRouteUtil>
};

export default BoardAdminPanelRoute;