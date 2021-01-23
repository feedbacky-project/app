import React from "react";

const BoardContext = React.createContext({
    data: {},
    loaded: false,
    error: false,
    //todo deprecated, subjects to merge into one update function
    updateSuspensions: (data) => {
    },
    updateTags: (data) => {
    },
    updateSocialLinks: (data) => {
    }
});

export default BoardContext;