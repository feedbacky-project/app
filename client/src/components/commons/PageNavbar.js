import styled from "@emotion/styled";
import {renderLogIn} from "components/commons/navbar-commons";
import {AppContext, BoardContext} from "context";
import React, {useContext} from 'react';
import {FaChevronLeft, FaRegComment, FaRegListAlt, FaRegMap, FaRegUser} from "react-icons/all";
import {Link} from "react-router-dom";
import {UiBadge} from "ui";
import {UiContainer} from "ui/grid";
import {UiNavbar, UiNavbarBrand, UiNavbarOption, UiNavbarSelectedOption} from "ui/navbar";

const GoBackButton = styled(Link)`
  position: absolute;
  margin-left: .75rem;
  margin-top: .5rem;
  justify-content: start;
  transition: var(--hover-transition);
  color: ${props => props.theme};
  
  &:hover {
    transform: var(--hover-transform-scale-lg);
    color: ${props => props.theme};
    text-decoration: none;
  }
  
  @media(max-width: 768px) {
    display: none;
  }  
`;

const SelectedRoute = styled(UiNavbarSelectedOption)`
  @media(max-width: 576px) {
    padding-bottom: 13px;
  }
`;

const NotificationBubble = styled(UiBadge)`
  border-radius: 50%;
  font-size: 10px;
  transform: translateY(-6px);
  padding: .2rem 0 0 0 !important;
  line-height: 1;
  width: 1rem;
  height: 1rem;
`;

const PageNavbar = ({selectedNode, goBackVisible = false}) => {
    const context = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const FeedbackComponent = selectedNode === "feedback" ? SelectedRoute : UiNavbarOption;
    const RoadmapComponent = selectedNode === "roadmap" ? SelectedRoute : UiNavbarOption;
    const ChangelogComponent = selectedNode === "changelog" ? SelectedRoute : UiNavbarOption;
    const renderChangelogNotificationBubble = () => {
        if(data.lastChangelogUpdate == null) {
            return <React.Fragment/>
        }
        const dateStr = localStorage.getItem("notifs_" + data.id + "_lastChangelogUpdate");
        if(dateStr == null) {
            return <NotificationBubble>1</NotificationBubble>
        }
        const date = Date.parse(dateStr);
        if(date < new Date(data.lastChangelogUpdate)) {
            return <NotificationBubble>1</NotificationBubble>
        }
        return <React.Fragment/>
    };

    return <UiNavbar>
        {goBackVisible && <GoBackButton theme={context.getTheme().toString()} to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}} aria-label={"Go Back"}>
            <FaChevronLeft className={"ml-2"}/>
        </GoBackButton>}
        <UiContainer className={"d-sm-flex d-block"}>
            <UiNavbarBrand theme={context.getTheme().toString()} to={{pathname: (goBackVisible ? "/b/" + data.discriminator : "/me"), state: {_boardData: data}}}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Board Logo"}/>
                <span className={"align-bottom"}>{data.name}</span>
            </UiNavbarBrand>
            {renderLogIn(onNotLoggedClick, context, data)}
            <div className={"d-sm-flex d-block my-sm-0 my-2 order-sm-1 order-2"} style={{fontWeight: "500", whiteSpace: "nowrap"}}>
                {selectedNode === "admin" &&
                <SelectedRoute to={{pathname: "/ba/" + data.discriminator, state: {_boardData: data}}}
                               theme={context.getTheme()} border={selectedNode === "admin" ? context.getTheme().setAlpha(.75) : undefined} aria-label={"Admin Panel"}>
                    <FaRegUser className={"mr-sm-2 mr-0 mx-sm-0 mx-1"}/>
                    <span className={"d-inline-block align-middle"}>Admin Panel</span>
                </SelectedRoute>
                }
                {selectedNode !== "admin" &&
                <FeedbackComponent to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}}
                                   theme={context.getTheme()} border={selectedNode === "feedback" ? context.getTheme().setAlpha(.75) : undefined} aria-label={"Feedback"}>
                    <FaRegComment className={"mr-sm-2 mr-0 mx-sm-0 mx-1"}/>
                    <span className={"d-inline-block align-middle"}>Feedback</span>
                </FeedbackComponent>
                }
                {(data.roadmapEnabled && selectedNode !== "admin") &&
                <RoadmapComponent to={{pathname: "/b/" + data.discriminator + "/roadmap", state: {_boardData: data}}}
                                  theme={context.getTheme()} border={selectedNode === "roadmap" ? context.getTheme().setAlpha(.75) : undefined} aria-label={"Roadmap"}>
                    <FaRegMap className={"mr-sm-2 mr-0 mx-sm-0 mx-1"}/>
                    <span className={"d-inline-block align-middle"}>Roadmap</span>
                </RoadmapComponent>
                }
                {(data.changelogEnabled && selectedNode !== "admin") &&
                <React.Fragment>
                    <ChangelogComponent to={{pathname: "/b/" + data.discriminator + "/changelog", state: {_boardData: data}}}
                                        theme={context.getTheme()} border={selectedNode === "changelog" ? context.getTheme().setAlpha(.75) : undefined} aria-label={"Changelog"}>
                        <FaRegListAlt className={"mr-sm-2 mr-0 mx-sm-0 mx-1"}/>
                        <span className={"d-inline-block align-middle"}>Changelog</span>
                        {renderChangelogNotificationBubble()}
                    </ChangelogComponent>
                </React.Fragment>
                }
            </div>
        </UiContainer>
    </UiNavbar>
};

export default PageNavbar;