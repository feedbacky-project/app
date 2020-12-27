import React, {useContext, useEffect, useState} from "react";
import AppContext from "context/app-context";
import axios from "axios";
import {useLocation, useParams} from "react-router-dom";
import ErrorView from "views/errors/error-view";
import {Container, Row} from "react-bootstrap";
import LoadingSpinner from "components/util/loading-spinner";
import {FaExclamationCircle} from "react-icons/all";
import LoginModal from "components/modal/login-modal";
import BoardContext from "context/board-context";
import {BoardRoadmap} from "components/roadmap/board-roadmap";
import IdeaNavbar from "components/navbars/idea-navbar";
import ComponentLoader from "components/app/component-loader";

const RoadmapView = () => {
    const context = useContext(AppContext);
    const location = useLocation();
    const params = useParams();
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [roadmap, setRoadmap] = useState({data: {}, loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const resolvePassedData = () => {
        const state = location.state;
        if (state._boardData !== undefined) {
            context.onThemeChange(state._boardData.themeColor || "#343a40");
            setBoard({...board, data: state._boardData, loaded: true});
            return true;
        }
        return false;
    };
    const loadRoadmapData = () => {
        axios.get("/boards/" + params.id + "/roadmap").then(res => {
            if (res.status !== 200) {
                setRoadmap({...roadmap, error: true});
                return;
            }
            setRoadmap({...roadmap, data: res.data, loaded: true});
        }).catch(() => setRoadmap({...roadmap, error: true}));
    };
    useEffect(() => {
        if (location.state != null) {
            if (resolvePassedData()) {
                loadRoadmapData();
                return;
            }
        }
        axios.get("/boards/" + params.id).then(res => {
            if (res.status !== 200) {
                setBoard({...board, error: true});
                return;
            }
            const data = res.data;
            data.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
            context.onThemeChange(data.themeColor || "#343a40");
            setBoard({...board, data, loaded: true});
        }).catch(() => setBoard({...board, error: true}));
        loadRoadmapData();
        // eslint-disable-next-line
    }, []);
    if (board.error || roadmap.error) {
        return <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>
    }
    if (!board.loaded) {
        return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
    }
    //INFO suspensions are unused in roadmaps
    return <BoardContext.Provider value={{
        data: board.data, loaded: board.loaded, error: board.error, updateSuspensions: () => {
        }
    }}>
        <LoginModal open={modalOpen} image={board.data.logo}
                    boardName={board.data.name} redirectUrl={"b/" + board.data.discriminator + "/roadmap"}
                    onLoginModalClose={() => setModalOpen(false)}/>
        <IdeaNavbar onNotLoggedClick={() => setModalOpen(true)}/>
        <Container className="pb-5">
            <Row className="pb-4 justify-content-center">
                <ComponentLoader loaded={roadmap.loaded} component={<BoardRoadmap data={roadmap.data} onNotLoggedClick={() => setModalOpen(true)}/>}/>
            </Row>
        </Container>
    </BoardContext.Provider>
};

export default RoadmapView;