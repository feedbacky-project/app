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
    const {user} = useContext(AppContext);
    const {onThemeChange} = useContext(UiThemeContext);
    const {id} = useParams();
    const location = useLocation();
    const history = useHistory();
    const [currentNode, setCurrentNode] = useState("general");
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    useEffect(() => {
        if (location.state == null) {
            axios.get("/boards/" + id).then(res => {
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
    }, [id]);

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
        history.push("/b/" + id);
        return <React.Fragment/>
    }
    const onWarn = () => console.warn("BoardAdminPanelRoute invalid onNotLoggedClick call");
    const onReRoute = route => history.push({pathname: "/ba/" + board.data.discriminator + "/" + route, state: {_boardData: board.data}})
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={onWarn} errorMessage={"Content Not Found"} errorIcon={FaExclamationCircle}>
        <PageNodesContext.Provider value={{setCurrentNode: setCurrentNode}}>
            <AdminSidebar currentNode={currentNode} reRouteTo={onReRoute} data={board}>
                <PageNavbar selectedNode={"admin"} goBackVisible/>
                <UiContainer>
                    <UiRow centered className={"pb-5"}>
                        <Suspense fallback={<UiCol xs={12}><UiRow centered className={"mt-5 pt-5"}><UiLoadingSpinner/></UiRow></UiCol>}>
                            <Switch>
                                <Route path={"/ba/:id/tags"} component={TagsSettings}/>
                                <Route path={"/ba/:id/moderators"} component={ModeratorsSettings}/>
                                <Route path={"/ba/:id/webhooks/create"} component={CreateWebhook}/>
                                <Route path={"/ba/:id/webhooks"} component={WebhooksSettings}/>
                                <Route path={"/ba/:id/social/create"} component={CreateSocialLink}/>
                                <Route path={"/ba/:id/social"} component={SocialLinksSettings}/>
                                <Route path={"/ba/:id/suspended"} component={SuspensionSettings}/>
                                <Route path={"/ba/:id/integrations"} component={IntegrationsSettings}/>
                                <Route path={"/ba/:id/general"} render={() => <GeneralSettings updateState={data => setBoard({...board, data})}/>}/>
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