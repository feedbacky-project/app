import React, {useContext, useEffect, useState} from 'react';
import axios from "axios";
import ErrorView from "views//errors/error-view";
import {FaExclamationCircle, FaSadTear} from "react-icons/fa";
import IdeaNavbar from "components/navbars/idea-navbar";
import LoginModal from "components/modal/login-modal";
import LoadingSpinner from "components/util/loading-spinner";
import IdeaDetailsBox from "components/idea/details/idea-details-box";
import DiscussionBox from "components/idea/discussion/discussion-box";
import {Col, Container, Row} from "react-bootstrap";
import AppContext from "context/app-context";
import ComponentLoader from "components/app/component-loader";
import BoardContext from "context/board-context";
import {useHistory, useLocation, useParams} from "react-router-dom";
import {convertIdeaToSlug} from "components/util/utils";

const IdeaView = () => {
    const history = useHistory();
    const extractIdeaId = (id) => {
        if (id.includes(".")) {
            return id.split(".")[1];
        }
        return id;
    };
    const context = useContext(AppContext);
    const id = extractIdeaId(useParams().id);
    const location = useLocation();
    const [idea, setIdea] = useState({data: [], loaded: false, error: false});
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const updateState = (data) => {
        setIdea({...idea, data});
        history.replace({pathname: location.pathname, state: null});
    };
    const loadBoardDataCascade = (ideaData) => {
        if (board.loaded) {
            return;
        }
        axios.get("/boards/" + ideaData.boardDiscriminator).then(res => {
            if (res.status !== 200) {
                setBoard({...board, error: true});
                return;
            }
            const boardData = res.data;
            boardData.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
            setBoard({...board, data: boardData, loaded: true});
            context.onThemeChange(boardData.themeColor);
        }).catch(() => setBoard({...board, error: true}));
    };
    useEffect(() => {
        if (location.state == null) {
            axios.get("/ideas/" + id).then(res => {
                if (res.status !== 200) {
                    setIdea({...idea, error: true});
                    return;
                }
                const ideaData = res.data;
                ideaData.tags.sort((a, b) => a.name.localeCompare(b.name));
                setIdea({...idea, data: ideaData, loaded: true});
                loadBoardDataCascade(ideaData);
            }).catch(() => setIdea({...idea, loaded: true, error: true}));
        } else {
            context.onThemeChange(location.state._boardData.themeColor);
            setIdea({...idea, data: location.state._ideaData, loaded: true});
            setBoard({...board, data: location.state._boardData, loaded: true});
        }
        // eslint-disable-next-line
    }, []);
    if (idea.error) {
        return <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>
    }
    if (board.error) {
        return <ErrorView icon={<FaSadTear className="error-icon"/>} message="Server Connection Error"/>
    }
    if (!board.loaded) {
        return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
    }
    return <BoardContext.Provider value={{
        data: board.data, loaded: board.loaded, error: board.error,
        updateSuspensions: (suspendedUsers) => {
            setBoard({...board, data: {...board.data, suspendedUsers}});
        }
    }}>
        <LoginModal open={modalOpen} onLoginModalClose={() => setModalOpen(false)} image={board.data.logo} boardName={board.data.name}
                    redirectUrl={"i/" + convertIdeaToSlug(idea.data)}/>
        <IdeaNavbar onNotLoggedClick={() => setModalOpen(true)}/>
        <Container className="pb-5">
            <Row className="justify-content-center pb-4">
                <ComponentLoader loaded={board.loaded} component={
                    <IdeaDetailsBox updateState={updateState} ideaData={idea.data} onNotLoggedClick={() => setModalOpen(true)}/>
                }/>
                <Col xs={12}>
                    <hr/>
                </Col>
                <ComponentLoader loaded={idea.loaded} component={
                    <DiscussionBox updateState={updateState} ideaData={idea.data} onNotLoggedClick={() => setModalOpen(true)}/>
                }/>
            </Row>
        </Container>
    </BoardContext.Provider>
};

export default IdeaView;