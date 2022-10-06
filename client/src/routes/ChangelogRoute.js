import axios from "axios";
import BoardBanner from "components/board/BoardBanner";
import BoardChangelogBox from "components/changelog/BoardChangelogBox";
import BoardChangelogSearchBar from "components/changelog/BoardChangelogSearchBar";
import PageNavbar from "components/commons/PageNavbar";
import LoginModal from "components/LoginModal";
import {AppContext} from "context";
import useBoardNavigationHotkeys from "hooks/use-board-navigation-hotkeys";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamationCircle} from "react-icons/fa";
import {useHistory, useLocation, useParams} from "react-router-dom";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import {UiThemeContext} from "ui";
import {UiContainer, UiRow} from "ui/grid";
import {useTitle} from "utils/use-title";

const ChangelogRoute = () => {
    const {user} = useContext(AppContext);
    const {onThemeChange, defaultTheme} = useContext(UiThemeContext);
    const location = useLocation();
    const history = useHistory();
    const {id} = useParams();
    const [board, setBoard] = useState({data: {}, loaded: false, error: false});
    const [searchQuery, setSearchQuery] = useState("");
    const [open, setOpen] = useState(false);
    useBoardNavigationHotkeys(id);
    useTitle(board.loaded ? board.data.name + " | Changelog" : "Loading...");
    const resolvePassedData = () => {
        const state = location.state;
        if (state._boardData !== undefined) {
            onThemeChange(state._boardData.themeColor || defaultTheme);
            setBoard({...board, data: state._boardData, loaded: true});
            localStorage.setItem("notifs_" + state._boardData.id + "_lastChangelogUpdate", state._boardData.lastChangelogUpdate);
            return true;
        }
        return false;
    };
    useEffect(() => {
        if (location.state != null) {
            if (resolvePassedData()) {
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
            localStorage.setItem("notifs_" + data.id + "_lastChangelogUpdate", data.lastChangelogUpdate);
        }).catch(() => setBoard({...board, error: true}));
        // eslint-disable-next-line
    }, [user.session]);

    if (board.loaded && !board.data.changelogEnabled) {
        history.push("/b/" + id);
        return <React.Fragment/>
    }
    const onNotLogged = () => setOpen(true);
    return <BoardContextedRouteUtil board={board} setBoard={setBoard} onNotLoggedClick={onNotLogged} errorMessage={"Content Not Found"} errorIcon={FaExclamationCircle}>
        <LoginModal isOpen={open} image={board.data.logo}
                    boardName={board.data.name} redirectUrl={"b/" + board.data.discriminator + "/changelog"}
                    onHide={() => setOpen(false)}/>
        <PageNavbar selectedNode={"changelog"}/>
        <UiContainer className={"pb-5"}>
            <UiRow className={"pb-4"}>
                <BoardBanner customName={board.data.name + " - Changelog"}/>
                <BoardChangelogSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                <BoardChangelogBox searchQuery={searchQuery}/>
            </UiRow>
        </UiContainer>
    </BoardContextedRouteUtil>
};

export default ChangelogRoute;