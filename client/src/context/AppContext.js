import React from "react";

const AppContext = React.createContext({
    apiRoute: "",
    user: {
        data: [], loggedIn: false, session: "", darkMode: false,
        onLogOut: () => void 0,
    },
    serviceData: [],
    onLocalPreferencesUpdate: () => void 0,
    appearance: {},
    onAppearanceToggle: (type) => void 0,
    getTheme: () => void 0,
    theme: "#343a40",
    defaultTheme: "#343a40",
    onThemeChange: () => void 0,
    hardResetData: () => void 0,
    clientVersion: ""
});

export default AppContext;