import axios from "axios";
import ComponentLoader from "components/ComponentLoader";
import DiscussionBox from "components/idea/DiscussionBox";
import IdeaInfoBox from "components/idea/IdeaInfoBox";
import IdeaNavbar from "components/idea/IdeaNavbar";
import LoginModal from "components/LoginModal";
import AppContext from "context/AppContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useEffect, useState} from 'react';
import {FaExclamationCircle} from "react-icons/fa";
import {useHistory, useLocation, useParams} from "react-router-dom";
import ErrorRoute from "routes/ErrorRoute";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {UiHorizontalRule} from "ui";
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
    const context = useContext(AppContext);
    const {user} = context;
    const id = extractIdeaId(useParams().id);
    const location = useLocation();
    const [idea, setIdea] = useState({data: {}, loaded: false, error: false});
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
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
    }, [user.session]);
    if (idea.error) {
        return <ErrorRoute Icon={FaExclamationCircle} message={"Content Not Found"}/>
    }
    if (!idea.loaded) {
        return <LoadingRouteUtil/>
    }
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={() => setModalOpen(true)}>
        <IdeaContext.Provider value={{
            ideaData: idea.data, loaded: idea.loaded, error: idea.error,
            updateState: data => {
                setIdea({...idea, data});
                history.replace({pathname: location.pathname, state: null});
            },
        }}>
            <LoginModal isOpen={modalOpen} onHide={() => setModalOpen(false)} image={board.data.logo} boardName={board.data.name}
                        redirectUrl={"i/" + convertIdeaToSlug(idea.data)}/>
            <IdeaNavbar/>
            <UiContainer className={"pb-5"}>
                <UiRow centered className={"my-4"}>
                    <ComponentLoader loaded={board.loaded} component={<IdeaInfoBox/>}/>
                    <UiCol xs={12}><UiHorizontalRule theme={context.getTheme().setAlpha(.1)}/></UiCol>
                    <ComponentLoader loaded={idea.loaded} component={<DiscussionBox/>}/>
                </UiRow>
            </UiContainer>
        </IdeaContext.Provider>
    </BoardContextedRouteUtil>
};

export default IdeaRoute;