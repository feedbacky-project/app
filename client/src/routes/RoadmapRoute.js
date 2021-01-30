import axios from "axios";
import BoardBanner from "components/board/BoardBanner";
import ComponentLoader from "components/ComponentLoader";
import IdeaNavbar from "components/idea/IdeaNavbar";
import LoginModal from "components/LoginModal";
import {BoardRoadmapBox} from "components/roadmap/BoardRoadmapBox";
import AppContext from "context/AppContext";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamationCircle} from "react-icons/all";
import {useLocation, useParams} from "react-router-dom";
import ErrorRoute from "routes/ErrorRoute";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import {UiLoadingSpinner} from "ui";
import {UiContainer, UiRow} from "ui/grid";

const RoadmapRoute = () => {
    const {onThemeChange, defaultTheme} = useContext(AppContext);
    const location = useLocation();
    const {id} = useParams();
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [roadmap, setRoadmap] = useState({data: {}, loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const resolvePassedData = () => {
        const state = location.state;
        if (state._boardData !== undefined) {
            onThemeChange(state._boardData.themeColor || defaultTheme);
            setBoard({...board, data: state._boardData, loaded: true});
            return true;
        }
        return false;
    };
    const loadRoadmapData = () => {
        axios.get("/boards/" + id + "/roadmap").then(res => {
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
        axios.get("/boards/" + id).then(res => {
            if (res.status !== 200) {
                setBoard({...board, error: true});
                return;
            }
            const data = res.data;
            data.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
            onThemeChange(data.themeColor || defaultTheme);
            setBoard({...board, data, loaded: true});
        }).catch(() => setBoard({...board, error: true}));
        loadRoadmapData();
        // eslint-disable-next-line
    }, []);
    if (roadmap.error) {
        return <ErrorRoute Icon={FaExclamationCircle} message={"Content Not Found"}/>
    }
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={() => setModalOpen(true)}
                                    errorMessage={"Content Not Found"} errorIcon={FaExclamationCircle}>
        <LoginModal isOpen={modalOpen} image={board.data.logo}
                    boardName={board.data.name} redirectUrl={"b/" + board.data.discriminator + "/roadmap"}
                    onHide={() => setModalOpen(false)}/>
        <IdeaNavbar/>
        <UiContainer className={"pb-5"}>
            <UiRow centered className={"pb-4"}>
                <BoardBanner customName={<React.Fragment>
                    {board.data.name} - Roadmap
                </React.Fragment>}/>
                <ComponentLoader loaded={roadmap.loaded} loader={<UiRow centered className={"mt-5 pt-5"}><UiLoadingSpinner/></UiRow>}
                                 component={<BoardRoadmapBox roadmapData={roadmap.data}/>}/>
            </UiRow>
        </UiContainer>
    </BoardContextedRouteUtil>
};

export default RoadmapRoute;