import {renderLogIn} from "components/commons/navbar-commons";
import {AppContext, BoardContext} from "context";
import React, {useContext} from 'react';
import {FaRegComment, FaRegListAlt, FaRegMap} from "react-icons/all";
import {UiContainer} from "ui/grid";
import {UiNavbar, UiNavbarBrand, UiNavbarOption, UiNavbarSelectedOption} from "ui/navbar";

const BoardNavbar = ({selectedNode}) => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const FeedbackComponent = selectedNode === "feedback" ? UiNavbarSelectedOption : UiNavbarOption;
    const RoadmapComponent = selectedNode === "roadmap" ? UiNavbarSelectedOption : UiNavbarOption;
    const ChangelogComponent = selectedNode === "changelog" ? UiNavbarSelectedOption : UiNavbarOption;

    return <UiNavbar>
        <UiContainer className={"d-flex"}>
            <UiNavbarBrand theme={context.getTheme().toString()} to={{pathname: "/me", state: {_boardData: data}}}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Board Logo"}/>
                <span className={"align-bottom"}>{data.name}</span>
            </UiNavbarBrand>
            <div className={"d-flex"} style={{fontWeight: "500"}}>
                <FeedbackComponent to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}}
                                   theme={context.getTheme()} border={selectedNode === "feedback" ? context.getTheme().setAlpha(.75) : undefined} aria-label={"Feedback"}>
                    <FaRegComment className={"mr-sm-2 mr-0 mx-sm-0 mx-1"}/>
                    <span className={"d-sm-inline-block d-none align-middle"}>Feedback</span>
                </FeedbackComponent>
                {data.roadmapEnabled &&
                <RoadmapComponent to={{pathname: "/b/" + data.discriminator + "/roadmap", state: {_boardData: data}}}
                                  theme={context.getTheme()} border={selectedNode === "roadmap" ? context.getTheme().setAlpha(.75) : undefined} aria-label={"Roadmap"}>
                    <FaRegMap className={"mr-sm-2 mr-0 mx-sm-0 mx-1"}/>
                    <span className={"d-sm-inline-block d-none align-middle"}>Roadmap</span>
                </RoadmapComponent>
                }
                {data.changelogEnabled &&
                <ChangelogComponent to={{pathname: "/b/" + data.discriminator + "/changelog", state: {_boardData: data}}}
                                    theme={context.getTheme()} border={selectedNode === "changelog" ? context.getTheme().setAlpha(.75) : undefined} aria-label={"Changelog"}>
                    <FaRegListAlt className={"mr-sm-2 mr-0 mx-sm-0 mx-1"}/>
                    <span className={"d-sm-inline-block d-none align-middle"}>Changelog</span>
                </ChangelogComponent>
                }
            </div>
            {renderLogIn(onNotLoggedClick, context, data)}
        </UiContainer>
    </UiNavbar>
};

export default BoardNavbar;