import {BoardContext} from "context";
import React from "react";
import {FaSadTear} from "react-icons/fa";
import ErrorRoute from "routes/ErrorRoute";
import LoadingRouteUtil from "routes/utils/LoadingRouteUtil";

const BoardContextedRouteUtil = ({board, setBoard, onNotLoggedClick, errorMessage = "Server Connection Error", errorIcon = FaSadTear, children}) => {
    if (board.error) {
        return <ErrorRoute Icon={errorIcon} message={errorMessage}/>
    }
    if (!board.loaded) {
        return <LoadingRouteUtil/>
    }
    return <BoardContext.Provider value={{
        data: board.data, loaded: board.loaded, error: board.error,
        onNotLoggedClick: onNotLoggedClick,
        updateState: data => {
            setBoard({...board, data});
        }
    }}>
        {children}
    </BoardContext.Provider>
};

export default BoardContextedRouteUtil;