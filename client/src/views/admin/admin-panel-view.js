import React, {useContext, useEffect, useState} from 'react';
import {Container, Row} from "react-bootstrap";
import {FaExclamationCircle} from "react-icons/fa";
import axios from "axios";
import GeneralSettings from "views/admin/subviews/general-settings";
import {Route, Switch, useHistory, useLocation, useParams} from "react-router-dom";
import IdeaNavbar from "components/navbars/idea-navbar";
import LoadingSpinner from "components/util/loading-spinner";
import ErrorView from "views/errors/error-view";
import AppContext from "context/app-context";
import TagsSettings from "views/admin/subviews/tags-settings";
import ModeratorsSettings from "views/admin/subviews/moderators-settings";
import WebhooksSettings from "views/admin/subviews/webhooks/webhooks-settings";
import SocialLinksSettings from "views/admin/subviews/social/social-links-settings";
import CreateSocialLink from "views/admin/subviews/social/create-social-link";
import CreateWebhook from "views/admin/subviews/webhooks/create-webhook";
import BoardContext from "context/board-context";
import SuspensionSettings from "views/admin/subviews/suspensions-settings";

const AdminPanelView = () => {
    const context = useContext(AppContext);
    const {id} = useParams();
    const location = useLocation();
    const history = useHistory();
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
    if (board.error) {
        return <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>
    }
    if (!board.loaded) {
        return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
    }
    if (!context.user.loggedIn) {
        history.push("/b/" + id);
        return <React.Fragment/>;
    }
    return <BoardContext.Provider value={{
        data: board.data, loaded: board.loaded, error: board.error,
        updateSuspensions: (suspendedUsers) => {
            setBoard({...board, data: {...board.data, suspendedUsers}});
        }
    }}>
        <IdeaNavbar/>
        <Container>
            <Row className="justify-content-center pb-4">
                <Switch>
                    <Route path="/ba/:id/tags" render={() => <TagsSettings reRouteTo={reRouteTo}/>}/>
                    <Route path="/ba/:id/moderators" render={() => <ModeratorsSettings reRouteTo={reRouteTo}/>}/>
                    <Route path="/ba/:id/webhooks/create" render={() => <CreateWebhook reRouteTo={reRouteTo} data={board.data}/>}/>
                    <Route path="/ba/:id/webhooks" render={() => <WebhooksSettings reRouteTo={reRouteTo}/>}/>
                    <Route path="/ba/:id/social/create" render={() => <CreateSocialLink reRouteTo={reRouteTo} data={board.data}/>}/>
                    <Route path="/ba/:id/social" render={() => <SocialLinksSettings reRouteTo={reRouteTo}/>}/>
                    <Route path="/ba/:id/suspended" render={() => <SuspensionSettings reRouteTo={reRouteTo}/>}/>
                    <Route path="/ba/:id/general" render={() => <GeneralSettings reRouteTo={reRouteTo} updateState={(data) => setBoard({...board, data})}/>}/>
                    <Route render={() => <GeneralSettings reRouteTo={reRouteTo} updateState={(data) => setBoard({...board, data})}/>}/>
                </Switch>
            </Row>
        </Container>
    </BoardContext.Provider>
};

export default AdminPanelView;