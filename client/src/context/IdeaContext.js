import React from "react";

const IdeaContext = React.createContext({
    ideaData: {},
    mentions: [],
    loaded: false,
    error: false,
    updateState: () => void 0,
});

export {IdeaContext};