import axios from "axios";
import PageNavbar from "components/commons/PageNavbar";
import ComponentLoader from "components/ComponentLoader";
import DiscussionBox from "components/idea/DiscussionBox";
import IdeaInfoBox from "components/idea/IdeaInfoBox";
import LoginModal from "components/LoginModal";
import {AppContext, IdeaContext} from "context";
import React, {useContext, useEffect, useRef, useState} from 'react';
import {FaExclamationCircle} from "react-icons/fa";
import {useHistory, useLocation, useParams} from "react-router-dom";
import ErrorRoute from "routes/ErrorRoute";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {UiHorizontalRule, UiThemeContext} from "ui";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {convertIdeaToSlug} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const IdeaRoute = () => {
    const history = useHistory();
    const extractIdeaId = (id) => {
        if (id.includes(".")) {
            return id.split(".")[1];
        }
        return id;
    };
    const {user} = useContext(AppContext);
    const {onThemeChange} = useContext(UiThemeContext);
    const id = extractIdeaId(useParams().id);
    const location = useLocation();
    const [idea, setIdea] = useState({data: {}, loaded: false, error: false});
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const discussionRef = useRef();
    const votersRef = useRef();
    useTitle((idea.loaded && board.loaded) ? board.data.name + " | " + idea.data.title : "Loading...");
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
            onThemeChange(boardData.themeColor);
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
            onThemeChange(location.state._boardData.themeColor);
            setIdea({...idea, data: location.state._ideaData, loaded: true});
            setBoard({...board, data: location.state._boardData, loaded: true});
        }
        // eslint-disable-next-line
    }, [user.session]);

    const onStateChange = (stateType) => {
        if(stateType === "discussion") {
            discussionRef.current.onStateChange();
        } else if(stateType === "voters") {
            votersRef.current.onStateChange();
        } else if(stateType === "both") {
            discussionRef.current.onStateChange();
            votersRef.current.onStateChange();
        }
    };
    if (idea.error) {
        return <ErrorRoute Icon={FaExclamationCircle} message={"Content Not Found"}/>
    }
    if (!idea.loaded) {
        return <LoadingRouteUtil/>
    }
    const onNotLogged = () => setModalOpen(true);
    const updateState = data => {
        setIdea({...idea, data});
        history.replace({pathname: location.pathname, state: null});
    };
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={onNotLogged}>
        <IdeaContext.Provider value={{ideaData: idea.data, loaded: idea.loaded, error: idea.error, updateState: updateState}}>
            <LoginModal isOpen={modalOpen} onHide={() => setModalOpen(false)} image={board.data.logo} boardName={board.data.name}
                        redirectUrl={"i/" + convertIdeaToSlug(idea.data)}/>
            <PageNavbar selectedNode={"feedback"} goBackVisible/>
            <UiContainer className={"pb-5"}>
                <UiRow centered className={"my-4"}>
                    <ComponentLoader loaded={board.loaded} component={<IdeaInfoBox onStateChange={onStateChange} ref={votersRef}/>}/>
                    <UiCol xs={12}><UiHorizontalRule/></UiCol>
                    <ComponentLoader loaded={idea.loaded} component={<DiscussionBox ref={discussionRef}/>}/>
                </UiRow>
            </UiContainer>
        </IdeaContext.Provider>
    </BoardContextedRouteUtil>
};

export default IdeaRoute;