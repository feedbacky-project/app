import React from "react";

const ThemeContext = React.createContext({
    darkMode: false,
    getTheme: () => void 0,
    theme: "#343a40",
    defaultTheme: "#343a40",
    onThemeChange: () => void 0,
});

export {ThemeContext};