import React, {lazy, Suspense, useContext, useEffect, useState} from 'react';
import {Col, Container, Row} from "react-bootstrap";
import {FaExclamationCircle} from "react-icons/fa";
import axios from "axios";
import {Route, Switch, useHistory, useLocation, useParams} from "react-router-dom";
import IdeaNavbar from "components/navbars/idea-navbar";
import LoadingSpinner from "components/util/loading-spinner";
import AppContext from "context/app-context";
import CommonBoardContextedView from "../common-board-contexted-view";
import PageNodesContext from "../../context/page-nodes-context";
import {retry} from "../../components/util/lazy-init";
import AdminSidebar from "../../components/sidebar/admin-sidebar";

const GeneralSettings = lazy(() => retry(() => import("views/admin/subviews/general-settings")));
const TagsSettings = lazy(() => retry(() => import("views/admin/subviews/tags-settings")));
const ModeratorsSettings = lazy(() => retry(() => import("views/admin/subviews/moderators-settings")));
const WebhooksSettings = lazy(() => retry(() => import("views/admin/subviews/webhooks/webhooks-settings")));
const CreateWebhook = lazy(() => retry(() => import("views/admin/subviews/webhooks/create-webhook")));
const SocialLinksSettings = lazy(() => retry(() => import("views/admin/subviews/social/social-links-settings")));
const CreateSocialLink = lazy(() => retry(() => import("views/admin/subviews/social/create-social-link")));
const SuspensionSettings = lazy(() => retry(() => import("views/admin/subviews/suspensions-settings")));

const AdminPanelView = () => {
    const context = useContext(AppContext);
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
                context.onThemeChange(data.themeColor);
            }).catch(() => setBoard({...board, error: true}));
        } else {
            resolvePassedData();
        }
        // eslint-disable-next-line
    }, []);

    const resolvePassedData = () => {
        const state = location.state;
        setBoard({...board, data: state._boardData, loaded: true});
        context.onThemeChange(state._boardData.themeColor);
    };
    const reRouteTo = (destination) => {
        history.push({
            pathname: "/ba/" + board.data.discriminator + "/" + destination,
            state: {_boardData: board.data},
        });
    };
    if (location.state != null && !board.loaded) {
        return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>;
    }
    if (!context.user.loggedIn) {
        history.push("/b/" + id);
        return <React.Fragment/>;
    }
    return <CommonBoardContextedView board={board} setBoard={setBoard} errorMessage={"Content Not Found"} errorIcon={<FaExclamationCircle className="error-icon"/>}>
        <PageNodesContext.Provider value={{setCurrentNode: setCurrentNode}}>
            <IdeaNavbar/>
            <Container>
                <Row className="justify-content-center pb-4">
                    <AdminSidebar currentNode={currentNode} reRouteTo={reRouteTo} data={board}/>
                    <Suspense fallback={<Col xs={12} md={9}><Row className="justify-content-center vertical-center"><LoadingSpinner/></Row></Col>}>
                        <Switch>
                            <Route path="/ba/:id/tags" component={TagsSettings}/>
                            <Route path="/ba/:id/moderators" component={ModeratorsSettings}/>
                            <Route path="/ba/:id/webhooks/create" component={CreateWebhook}/>
                            <Route path="/ba/:id/webhooks" component={WebhooksSettings}/>
                            <Route path="/ba/:id/social/create" component={CreateSocialLink}/>
                            <Route path="/ba/:id/social" component={SocialLinksSettings}/>
                            <Route path="/ba/:id/suspended" component={SuspensionSettings}/>
                            <Route path="/ba/:id/general" render={() => <GeneralSettings updateState={(data) => setBoard({...board, data})}/>}/>
                            <Route render={() => <GeneralSettings updateState={(data) => setBoard({...board, data})}/>}/>
                        </Switch>
                    </Suspense>
                </Row>
            </Container>
        </PageNodesContext.Provider>
    </CommonBoardContextedView>
};

export default AdminPanelView;