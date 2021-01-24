import React, {useContext, useEffect, useState} from 'react';
import axios from "axios";
import ErrorView from "views//errors/error-view";
import {FaExclamationCircle} from "react-icons/fa";
import IdeaNavbar from "components/navbars/idea-navbar";
import LoginModal from "components/modal/login-modal";
import IdeaDetailsBox from "components/idea/details/idea-details-box";
import DiscussionBox from "components/idea/discussion/discussion-box";
import {Col, Container, Row} from "react-bootstrap";
import AppContext from "context/app-context";
import ComponentLoader from "components/app/component-loader";
import {useHistory, useLocation, useParams} from "react-router-dom";
import {convertIdeaToSlug} from "components/util/utils";
import CommonBoardContextedView from "./common-board-contexted-view";
import LoadingSpinner from "../components/util/loading-spinner";
import IdeaContext from "../context/idea-context";

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
    if (!idea.loaded) {
        return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
    }
    return <CommonBoardContextedView board={board} setBoard={setBoard}>
        <IdeaContext.Provider value={{
            ideaData: idea.data, loaded: idea.loaded, error: idea.error,
            updateState: (data) => {
                setIdea({...idea, data});
                history.replace({pathname: location.pathname, state: null});
            },
        }}>
            <LoginModal open={modalOpen} onLoginModalClose={() => setModalOpen(false)} image={board.data.logo} boardName={board.data.name}
                        redirectUrl={"i/" + convertIdeaToSlug(idea.data)}/>
            <IdeaNavbar onNotLoggedClick={() => setModalOpen(true)}/>
            <Container className="pb-5">
                <Row className="justify-content-center pb-4">
                    <ComponentLoader loaded={board.loaded} component={<IdeaDetailsBox onNotLoggedClick={() => setModalOpen(true)}/>}/>
                    <Col xs={12}><hr/></Col>
                    <ComponentLoader loaded={idea.loaded} component={<DiscussionBox onNotLoggedClick={() => setModalOpen(true)}/>}/>
                </Row>
            </Container>
        </IdeaContext.Provider>
    </CommonBoardContextedView>
};

export default IdeaView;