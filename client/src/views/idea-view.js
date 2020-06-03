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
import {FaEyeSlash} from "react-icons/all";
import ComponentLoader from "components/app/component-loader";
import BoardContext from "context/board-context";
import {useHistory, useLocation, useParams} from "react-router-dom";

const IdeaView = () => {
    const context = useContext(AppContext);
    const {id} = useParams();
    const history = useHistory();
    const location = useLocation();
    const [idea, setIdea] = useState({data: [], loaded: false, error: false});
    const [board, setBoard] = useState({data: [], loaded: false, error: false, privatePage: false});
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
                if (ideaData.title === null && ideaData.user === null) {
                    setIdea({...idea, loaded: true});
                    setBoard({...board, loaded: true, privatePage: true});
                    return;
                }
                ideaData.tags.sort((a, b) => a.name.localeCompare(b.name));
                setIdea({...idea, data: ideaData, loaded: true});
                loadBoardDataCascade(ideaData);
            }).catch(() => setIdea({...idea, loaded: true, error: true}));
        } else {
            context.onThemeChange(location.state._boardData.themeColor);
            setIdea({...idea, data: location.state._ideaData, loaded: true});
            setBoard({...board, data: location.state._boardData, loaded: true});
        }
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
    if (board.privatePage) {
        return <ErrorView icon={<FaEyeSlash className="error-icon"/>} message="This Idea Is Private"/>
    }
    return <BoardContext.Provider value={{data: board.data, loaded: board.loaded, error: board.error}}>
        <LoginModal open={modalOpen} onLoginModalClose={() => setModalOpen(false)} image={board.data.logo} boardName={board.data.name} redirectUrl={"i/" + idea.data.id}/>
        <IdeaNavbar onNotLoggedClick={() => setModalOpen(true)}/>
        <Container className="pb-5">
            <Row className="justify-content-center pb-4">
                <ComponentLoader loaded={board.loaded} component={
                    <IdeaDetailsBox updateState={updateState} moderators={board.data.moderators} ideaData={idea.data} onNotLoggedClick={() => setModalOpen(true)}/>
                }/>
                <Col xs={12}>
                    <hr/>
                </Col>
                <ComponentLoader loaded={idea.loaded} component={
                    <DiscussionBox updateState={updateState} moderators={board.data.moderators} ideaData={idea.data}/>
                }/>
            </Row>
        </Container>
    </BoardContext.Provider>
};

export default IdeaView;