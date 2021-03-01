import styled from "@emotion/styled";
import AppearanceCard from "components/profile/AppearanceCard";
import AppContext from "context/AppContext";
import PageNodesContext from "context/PageNodesContext";
import React, {useContext, useEffect} from "react";
import {UiBadge} from "ui";
import {UiCol} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {useTitle} from "utils/use-title";

const InlineCard = styled.div`
  margin-bottom: .5rem;
  display: inline-block;
`;

const AppearanceSubroute = () => {
    const {appearance, onAppearanceToggle, getTheme} = useContext(AppContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    useEffect(() => setCurrentNode("appearance"), [setCurrentNode]);
    useTitle("Profile | Appearance");
    const renderContent = () => {
        return <UiCol xs={12} className={"my-2 text-center"}>
            <h4 className={"mb-1"}>Application Theme</h4>
            <InlineCard>
                <AppearanceCard imgSrc={"https://cdn.feedbacky.net/static/img/appearance/system.png"} chosen={appearance.systemDefault}
                                alt={"System Default Theme"} onClick={() => onAppearanceToggle("system")}/>
                <UiBadge>System Default</UiBadge>
            </InlineCard>
            <InlineCard>
                <AppearanceCard imgSrc={"https://cdn.feedbacky.net/static/img/appearance/light.png"} chosen={appearance.mode === "light" && !appearance.systemDefault}
                                alt={"Light Theme"} onClick={() => onAppearanceToggle("light")}/>
                <UiBadge>Light</UiBadge>
            </InlineCard>
            <InlineCard>
                <AppearanceCard imgSrc={"https://cdn.feedbacky.net/static/img/appearance/dark.png"} chosen={appearance.mode === "dark" && !appearance.systemDefault}
                                alt={"Dark Theme"} onClick={() => onAppearanceToggle("dark")}/>
                <UiBadge>Dark</UiBadge>
            </InlineCard>
        </UiCol>
    };
    return <UiCol xs={12} md={9}>
        <UiViewBox theme={getTheme(false)} title={"Appearance"} description={"Configure how Feedbacky will look like."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default AppearanceSubroute;