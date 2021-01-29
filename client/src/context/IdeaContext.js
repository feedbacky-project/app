import React from "react";

const IdeaContext = React.createContext({
    ideaData: {},
    loaded: false,
    error: false,
    updateState: () => void 0,
});

export default IdeaContext;