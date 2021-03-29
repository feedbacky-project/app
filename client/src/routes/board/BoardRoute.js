import axios from "axios";
import BoardBanner from "components/board/BoardBanner";
import BoardIdeaCardContainer from "components/board/BoardIdeaCardContainer";
import BoardNavbar from "components/commons/BoardNavbar";
import BoardSearchBar from "components/board/BoardSearchBar";
import LoginModal from "components/LoginModal";
import AppContext from "context/AppContext";
import React, {useContext, useEffect, useState} from 'react';
import {FaExclamationCircle} from "react-icons/fa";
import {useLocation, useParams} from "react-router-dom";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import {UiContainer, UiRow} from "ui/grid";
import {useTitle} from "utils/use-title";

const BoardRoute = () => {
    const {onThemeChange, defaultTheme} = useContext(AppContext);
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const location = useLocation();
    const {id} = useParams();
    useEffect(() => {
        //reset search query for board switch
        setSearchQuery("");
        if (location.state == null || location.state._boardData === undefined) {
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
        } else {
            onThemeChange(location.state._boardData.themeColor || defaultTheme);
            setBoard({...board, data: location.state._boardData, loaded: true});
        }
        // eslint-disable-next-line
    }, [id]);
    useTitle(board.loaded ? board.data.name : "Loading...");
    return <BoardContextedRouteUtil board={board} setBoard={data => setBoard(data)} onNotLoggedClick={() => setModalOpen(true)} errorMessage={"Content Not Found"} errorIcon={FaExclamationCircle}>
        <LoginModal isOpen={modalOpen} image={board.data.logo} boardName={board.data.name} redirectUrl={"b/" + board.data.discriminator} onHide={() => setModalOpen(false)}/>
        <BoardNavbar selectedNode={"feedback"}/>
        <UiContainer className={"pb-5"}>
            <UiRow className={"pb-4"}>
                <BoardBanner/>
                <BoardSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                <BoardIdeaCardContainer id={id} searchQuery={searchQuery}/>
            </UiRow>
        </UiContainer>
    </BoardContextedRouteUtil>
};

export default BoardRoute;
