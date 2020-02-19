import React from "react";

const AppContext = React.createContext({
    apiRoute: "https://app.feedbacky.net/v1/",
    user: {
        data: [], loggedIn: false, session: "", darkMode: false,
        onLogOut: () => {},
    },
    onFilteringUpdate: () => {},
    onSortingUpdate: () => {},
    onDarkModeToggle: () => {},
    theme: "#343a40",
    onThemeChange: () => {},
});

export default AppContext;