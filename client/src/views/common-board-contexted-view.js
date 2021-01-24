import React from "react";
import BoardContext from "../context/board-context";
import {Row} from "react-bootstrap";
import LoadingSpinner from "../components/util/loading-spinner";
import ErrorView from "./errors/error-view";
import {FaSadTear} from "react-icons/all";

const CommonBoardContextedView = ({board, setBoard, errorMessage = "Server Connection Error", errorIcon = <FaSadTear className="error-icon"/>, children}) => {
    if (board.error) {
        return <ErrorView icon={errorIcon} message={errorMessage}/>
    }
    if (!board.loaded) {
        return <Row className="justify-content-center vertical-center"><LoadingSpinner/></Row>
    }
    return <BoardContext.Provider value={{
        data: board.data, loaded: board.loaded, error: board.error,
        updateState: data => {
          setBoard({...board, data});
        }
    }}>
        {children}
    </BoardContext.Provider>
};

export default CommonBoardContextedView;