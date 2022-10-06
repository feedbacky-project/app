import axios from "axios";
import BoardBanner from "components/board/BoardBanner";
import PageNavbar from "components/commons/PageNavbar";
import ComponentLoader from "components/ComponentLoader";
import LoginModal from "components/LoginModal";
import BoardRoadmapBox from "components/roadmap/BoardRoadmapBox";
import {AppContext} from "context";
import useBoardNavigationHotkeys from "hooks/use-board-navigation-hotkeys";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamationCircle} from "react-icons/fa";
import {useHistory, useLocation, useParams} from "react-router-dom";
import ErrorRoute from "routes/ErrorRoute";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import {UiLoadingSpinner, UiThemeContext} from "ui";
import {UiContainer, UiRow} from "ui/grid";
import {useTitle} from "utils/use-title";

const RoadmapRoute = () => {
    const {user} = useContext(AppContext);
    const {onThemeChange, defaultTheme} = useContext(UiThemeContext);
    const location = useLocation();
    const history = useHistory();
    const {id} = useParams();
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [roadmap, setRoadmap] = useState({data: {}, loaded: false, error: false});
    const [open, setOpen] = useState(false);
    useBoardNavigationHotkeys(id);
    useTitle(board.loaded ? board.data.name + " | Roadmap" : "Loading...");
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
    }, [user.session]);

    if(board.loaded && !board.data.roadmapEnabled) {
        history.push("/b/" + id);
        return <React.Fragment/>
    }
    if (roadmap.error) {
        return <ErrorRoute Icon={FaExclamationCircle} message={"Content Not Found"}/>
    }
    const onNotLogged = () => setOpen(true);
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={onNotLogged} errorMessage={"Content Not Found"} errorIcon={FaExclamationCircle}>
        <LoginModal isOpen={open} image={board.data.logo}
                    boardName={board.data.name} redirectUrl={"b/" + board.data.discriminator + "/roadmap"}
                    onHide={() => setOpen(false)}/>
        <PageNavbar selectedNode={"roadmap"}/>
        <UiContainer className={"pb-5"}>
            <UiRow centered className={"pb-4"}>
                <BoardBanner customName={board.data.name + " - Roadmap"}/>
                <ComponentLoader loaded={roadmap.loaded} loader={<UiRow centered className={"mt-5 pt-5"}><UiLoadingSpinner/></UiRow>}
                                 component={<BoardRoadmapBox roadmapData={roadmap.data}/>}/>
            </UiRow>
        </UiContainer>
    </BoardContextedRouteUtil>
};

export default RoadmapRoute;