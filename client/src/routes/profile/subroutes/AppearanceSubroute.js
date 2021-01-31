import AppearanceCard from "components/profile/AppearanceCard";
import AppContext from "context/AppContext";
import PageNodesContext from "context/PageNodesContext";
import React, {useContext, useEffect, useState} from "react";
import {UiBadge} from "ui";
import {UiCol} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {getCookieOrDefault} from "utils/basic-utils";

const AppearanceSubroute = () => {
    const getDefaultThemeType = () => {
        const val = getCookieOrDefault("prefs_darkMode", null);
        if (val == null) {
            return "system";
        } else {
            return user.darkMode ? "dark" : "light";
        }
    };
    const {user, onDarkModeToggle, getTheme} = useContext(AppContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [themeType, setThemeType] = useState(getDefaultThemeType());
    useEffect(() => setCurrentNode("appearance"), [setCurrentNode]);
    if (!user.loggedIn) {
        return <UiCol xs={12} md={9}>
            <UiViewBox theme={getTheme(false)} title={"Appearance"} description={"Configure how Feedbacky will look like."}>
                <UiCol className={"text-center py-4"}>Please log in to see contents of this page.</UiCol>
            </UiViewBox>
        </UiCol>
    }
    const renderContent = () => {
        return <React.Fragment>
            <UiCol xs={12} className={"my-2 text-center"}>
                <h4 className={"mb-1"}>Application Theme</h4>
                <div className={"d-inline-block mb-2"}>
                    <AppearanceCard imgSrc={"https://cdn.feedbacky.net/static/img/appearance/system.png"} chosen={themeType === "system"} onClick={() => {
                        setThemeType("system");
                        onDarkModeToggle("system");
                    }}/>
                    <UiBadge>System Default</UiBadge>
                </div>
                <div className={"d-inline-block mb-2"}>
                    <AppearanceCard imgSrc={"https://cdn.feedbacky.net/static/img/appearance/light.png"} chosen={themeType === "light"} onClick={() => {
                        setThemeType("light");
                        onDarkModeToggle("light");
                    }}/>
                    <UiBadge>Light</UiBadge>
                </div>
                <div className={"d-inline-block mb-2"}>
                    <AppearanceCard imgSrc={"https://cdn.feedbacky.net/static/img/appearance/dark.png"} chosen={themeType === "dark"} onClick={() => {
                        setThemeType("dark");
                        onDarkModeToggle("dark");
                    }}/>
                    <UiBadge>Dark</UiBadge>
                </div>
            </UiCol>
        </React.Fragment>
    };
    return <UiCol xs={12} md={9}>
        <UiViewBox theme={getTheme(false)} title={"Appearance"} description={"Configure how Feedbacky will look like."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default AppearanceSubroute;