import axios from "axios";
import PageNavbar from "components/commons/PageNavbar";
import ComponentLoader from "components/ComponentLoader";
import DiscussionBox from "components/idea/DiscussionBox";
import IdeaInfoBox from "components/idea/IdeaInfoBox";
import LoginModal from "components/LoginModal";
import {AppContext, IdeaContext} from "context";
import React, {useContext, useEffect, useRef, useState} from 'react';
import {useHotkeys} from "react-hotkeys-hook";
import {FaExclamationCircle} from "react-icons/fa";
import {useHistory, useLocation, useParams} from "react-router-dom";
import ErrorRoute from "routes/ErrorRoute";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";
import {UiHorizontalRule, UiThemeContext} from "ui";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {convertIdeaToSlug, scrollIntoView} from "utils/basic-utils";
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
    const {getTheme, onThemeChange} = useContext(UiThemeContext);
    const id = extractIdeaId(useParams().id);
    const location = useLocation();
    const [idea, setIdea] = useState({data: {}, loaded: false, error: false});
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [mentions, setMentions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const discussionRef = useRef();
    const votersRef = useRef();
    const focusComment = element => {
        element.classList.add("hotkey-focused");
        element.onblur = () => element.classList.remove("hotkey-focused");
        scrollIntoView(element.id, false);
    }
    useHotkeys(",", e => {
        //update css only when we use hotkey, don't update on each theme change in case of performance issues
        [...document.styleSheets[0].cssRules].find(x => x.selectorText === '.hotkey-focused').style['outline'] = '2px dashed ' + getTheme().toString();

        e.preventDefault();
        const elements = document.querySelectorAll('*[id^="commentc_"]');
        let focusUpdated = false;
        elements.forEach((comment, i) => {
            if (focusUpdated) {
                return;
            }
            if (comment.classList.contains("hotkey-focused")) {
                if (i >= 1) {
                    comment.classList.remove("hotkey-focused");
                    focusComment(elements[i - 1]);
                }
                focusUpdated = true;
            }
        });
        if (!focusUpdated) {
            focusComment(elements[0]);
        }
    }, [getTheme]);
    useHotkeys(".", e => {
        //update css only when we use hotkey, don't update on each theme change in case of performance issues
        [...document.styleSheets[0].cssRules].find(x => x.selectorText === '.hotkey-focused').style['outline'] = '2px dashed ' + getTheme().toString();

        e.preventDefault();
        const elements = document.querySelectorAll('*[id^="commentc_"]');
        let focusUpdated = false;
        elements.forEach((comment, i) => {
            if (focusUpdated) {
                return;
            }
            if (comment.classList.contains("hotkey-focused")) {
                if (i < elements.length - 1) {
                    comment.classList.remove("hotkey-focused");
                    focusComment(elements[i + 1]);
                }
                focusUpdated = true;
            }
        });
        if (!focusUpdated) {
            focusComment(elements[0]);
        }
    }, [getTheme]);
    useHotkeys("left", e => {
        if (!board.loaded) {
            return;
        }
        e.preventDefault();
        history.push("/b/" + board.data.discriminator);
    }, [board]);
    useHotkeys("r", e => {
        const elements = document.getElementsByClassName("hotkey-focused");
        if (elements.length === 0) {
            return;
        }
        const comment = elements[0];
        document.querySelector("#" + comment.id + " [data-id='reply']").click();
    });
    useHotkeys("v", e => {
        e.preventDefault();
        document.querySelector("[data-id='vote']").click();
    });
    useHotkeys("c", e => {
        e.preventDefault();
        document.querySelector("#commentMessage").focus();
    });
    useHotkeys("m", e => {
        if (!board.loaded || !board.data.moderators.find(mod => mod.userId === user.data.id)) {
            return;
        }
        e.preventDefault();
        const button = document.querySelector("[data-id='moderation-toggle']");
        button.click();
        setTimeout(() => {
            const dropdown = document.querySelector("[data-id='moderation-menu'] > span");
            dropdown.focus();
        }, 200);
    }, [board]);
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
    useEffect(() => {
        axios.get("/ideas/" + id + "/mentionableUsers").then(res => setMentions(res.data));
    }, [id]);

    const onStateChange = (stateType) => {
        if (stateType === "discussion") {
            discussionRef.current.onStateChange();
        } else if (stateType === "voters") {
            votersRef.current.onStateChange();
        } else if (stateType === "both") {
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
        <IdeaContext.Provider value={{ideaData: idea.data, loaded: idea.loaded, error: idea.error, updateState: updateState, mentions: mentions}}>
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