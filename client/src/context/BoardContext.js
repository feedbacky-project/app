import React from "react";

const BoardContext = React.createContext({
    data: {},
    loaded: false,
    error: false,
    onNotLoggedClick: () => void 0,
    updateState: () => void 0
});

export default BoardContext;