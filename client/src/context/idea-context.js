import React from "react";

const IdeaContext = React.createContext({
    ideaData: {},
    loaded: false,
    error: false,
    updateState: (ideaData) => {
    },
});

export default IdeaContext;