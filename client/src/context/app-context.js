import React from "react";

const AppContext = React.createContext({
    apiRoute: "",
    user: {
        data: [], loggedIn: false, session: "", darkMode: false,
        onLogOut: () => {},
    },
    serviceData: [],
    onLocalPreferencesUpdate: () => {},
    onDarkModeToggle: () => {},
    getTheme: () => {},
    theme: "#343a40",
    onThemeChange: () => {},
    hardResetData: () => {},
    clientVersion: ""
});

export default AppContext;