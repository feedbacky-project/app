import React from "react";

const BoardContext = React.createContext({
    data: {},
    loaded: false,
    error: false,
    updateState: (data) => {
    }
});

export default BoardContext;