import React from "react";

const BoardContext = React.createContext({
    data: {},
    loaded: false,
    error: false,
    updateSuspensions: (data) => {
    },
});

export default BoardContext;