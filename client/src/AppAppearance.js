import App, {WCAG_AA_CONTRAST} from "App";
import Cookies from "js-cookie";
import React, {useEffect, useState} from "react";
import tinycolor from "tinycolor2";
import {getCookieOrDefault} from "utils/basic-utils";

export const DEFAULT_THEME = "#343a40";
export const LIGHT_THEME_COLOR = "#0776c4";
export const DARK_THEME_COLOR = "#6bbef9";

const AppAppearance = () => {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const generateAppearanceData = () => {
        const cookie = getCookieOrDefault("prefs_appearance", null);
        const systemDefault = cookie == null;
        let mode;
        if(cookie == null) {
            if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                mode = "dark";
            } else {
                mode = "light";
            }
        } else {
            mode = cookie;
        }
        return {mode, systemDefault};
    };
    const [appearance, setAppearance] = useState(generateAppearanceData());
    useEffect(() => {
        if (appearance.mode === "dark") {
            document.body.classList.add("dark");
        }
    }, [appearance.mode]);
    const getTheme = (adjustColor = true) => {
        let color = tinycolor(theme);
        if (appearance.mode === "dark" && adjustColor) {
            color = color.lighten(10);
            //if still not readable, increase again
            if (tinycolor.readability(color, "#282828") < WCAG_AA_CONTRAST) {
                color = color.lighten(25);
            }
        }
        return color.clone();
    };
    const onAppearanceToggle = (type = null) => {
        if(type != null) {
            if(type === "system") {
                Cookies.remove("prefs_appearance");
                if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.body.classList.add("dark");
                    setAppearance({...appearance, mode: "dark", systemDefault: true});
                } else {
                    document.body.classList.remove("dark");
                    setAppearance({...appearance, mode: "light", systemDefault: true});
                }
            } else if(type === "dark") {
                Cookies.set("prefs_appearance", "dark", {expires: 10 * 365 * 7 /* 10 years */, sameSite: "Lax"});
                setAppearance({...appearance, mode: "dark", systemDefault: false});
                document.body.classList.add("dark");
            } else if(type === "light") {
                Cookies.set("prefs_appearance", "light", {expires: 10 * 365 * 7 /* 10 years */, sameSite: "Lax"});
                setAppearance({...appearance, mode: "light", systemDefault: false});
                document.body.classList.remove("dark");
            }
            return;
        }
        if(appearance.mode === "dark") {
            setAppearance({...appearance, mode: "light"});
            document.body.classList.remove("dark");
            if(!appearance.systemDefault) {
                Cookies.set("prefs_appearance", "light", {expires: 10 * 365 * 7 /* 10 years */, sameSite: "Lax"});
            }
        } else if(appearance.mode === "light") {
            setAppearance({...appearance, mode: "dark"});
            document.body.classList.add("dark");
            if(!appearance.systemDefault) {
                Cookies.set("prefs_appearance", "dark", {expires: 10 * 365 * 7 /* 10 years */, sameSite: "Lax"});
            }
        }
    };
    return <App appearanceSettings={{theme, setTheme, appearance, setAppearance, getTheme, onAppearanceToggle: onAppearanceToggle}}/>
};

export default AppAppearance;