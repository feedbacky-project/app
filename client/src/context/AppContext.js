import React from "react";

const AppContext = React.createContext({
    apiRoute: "",
    user: {
        data: [], loggedIn: false, session: "", darkMode: false,
        onLogOut: () => {},
    },
    loginProviders: [],
    onFilteringUpdate: () => {},
    onSortingUpdate: () => {},
    onDarkModeToggle: () => {},
    theme: "#343a40",
    onThemeChange: () => {},
});

export default AppContext;