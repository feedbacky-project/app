import App from "App";
import Cookies from "js-cookie";
import React, {useEffect, useState} from "react";
import tinycolor from "tinycolor2";
import {getCookieOrDefault} from "utils/basic-utils";

export const DEFAULT_THEME = "#343a40";

const AppAppearance = () => {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [darkMode, setDarkMode] = useState(getCookieOrDefault("prefs_darkMode", "false") === 'true');
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else if (getCookieOrDefault("prefs_darkMode", null) == null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
            document.body.classList.add("dark");
        }
    }, [darkMode]);
    const getTheme = (adjustColor = true) => {
        let color = tinycolor(theme);
        if (darkMode && adjustColor) {
            color = color.lighten(10);
            //if still not readable, increase again
            if (tinycolor.readability(color, "#282828") < 2.5) {
                color = color.lighten(25);
            }
        }
        return color.clone();
    };
    const onDarkModeToggle = (type = null) => {
        if(type != null) {
            if(type === "system") {
                Cookies.remove("prefs_darkMode");
                if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.body.classList.add("dark");
                    setDarkMode(true);
                } else {
                    document.body.classList.remove("dark");
                    setDarkMode(false);
                }
            } else if(type === "dark") {
                Cookies.set("prefs_darkMode", "true", {expires: 10 * 365 * 7 /* 10 years */});
                document.body.classList.add("dark");
                setDarkMode(true);
            } else if(type === "light") {
                Cookies.set("prefs_darkMode", "false", {expires: 10 * 365 * 7 /* 10 years */});
                document.body.classList.remove("dark");
                setDarkMode(false);
            }
            return;
        }
        let darkModeEnabled = (getCookieOrDefault("prefs_darkMode", "false") === 'true');
        Cookies.set("prefs_darkMode", (!darkModeEnabled).toString(), {expires: 10 * 365 * 7 /* 10 years */});
        if (darkMode) {
            document.body.classList.remove("dark");
        } else {
            document.body.classList.add("dark");
        }
        setDarkMode(!darkMode);
    };
    return <App appearanceSettings={{theme, setTheme, darkMode, getTheme, onDarkModeToggle}}/>
};

export default AppAppearance;