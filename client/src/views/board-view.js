import React, {useContext, useEffect, useState} from 'react';
import BoardNavbar from "components/navbars/board-navbar";
import BoardSearchBar from "components/board/searchbar/board-search-bar";
import BoardContainer from "components/board/ideas/board-container";
import axios from "axios";
import ErrorView from "views/errors/error-view";
import {FaExclamationCircle} from "react-icons/fa";
import {Container, Row} from "react-bootstrap";
import LoginModal from "components/modal/login-modal";
import BoardBanner from "components/board/board-banner";
import LoadingSpinner from "components/util/loading-spinner";
import AppContext from "context/app-context";
import BoardContext from "context/board-context";
import {useLocation, useParams} from "react-router-dom";

const BoardView = () => {
    const context = useContext(AppContext);
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const location = useLocation();
    const {id} = useParams();
    useEffect(() => {
        if (location.state == null || location.state._boardData === undefined) {
            axios.get("/boards/" + id).then(res => {
                if (res.status !== 200) {
                    setBoard({...board, error: true});
                    return;
                }
                const data = res.data;
                data.socialLinks.sort((a, b) => (a.id > b.id) ? 1 : -1);
                context.onThemeChange(data.themeColor || "#343a40");
                setBoard({...board, data, loaded: true});
            }).catch(() => setBoard({...board, error: true}));
        } else {
            context.onThemeChange(location.state._boardData.themeColor || "#343a40");
            setBoard({...board, data: location.state._boardData, loaded: true});
        }
        // eslint-disable-next-line
    }, [id]);
    if (board.error) {
        return <ErrorView icon={<FaExclamationCircle className="error-icon"/>} message="Content Not Found"/>
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
        <LoginModal open={modalOpen} image={board.data.logo} boardName={board.data.name} redirectUrl={"b/" + board.data.discriminator} onLoginModalClose={() => setModalOpen(false)}/>
        <BoardNavbar onNotLoggedClick={() => setModalOpen(true)}/>
        <Container className="pb-5">
            <Row className="pb-4">
                <BoardBanner/>
                <BoardSearchBar/>
                <BoardContainer id={id} onNotLoggedClick={() => setModalOpen(true)}/>
            </Row>
        </Container>
    </BoardContext.Provider>
};

export default BoardView;
