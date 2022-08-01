import styled from "@emotion/styled";
import {renderLogIn} from "components/commons/navbar-commons";
import {AppContext, BoardContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import {FaBars, FaChevronLeft, FaRegComment, FaRegListAlt, FaRegMap, FaRegUser} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiBadge, UiThemeContext} from "ui";
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
    color: ${props => props.theme};
    text-decoration: none;

    @media (prefers-reduced-motion: no-preference) {
      animation: Move 1s linear infinite;

      @keyframes Move {
        0%, 100% {
          transform: translateX(0px);
        }
        50% {
          transform: translateX(-5px);
        }
      }
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SelectedRoute = styled(UiNavbarSelectedOption)`
  @media (max-width: 768px) {
    padding-bottom: 13px;
  }
`;

const RouteName = styled.span`
  display: inline-block;
  vertical-align: middle;
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

const ToggleContainer = styled.div`
  font-weight: 500;
  color: ${props => props.theme};
  flex: 1 1;
  margin-right: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 1.15rem;
  display: inline-block;
  padding: .25rem 0;

  &:hover {
    color: ${props => props.theme};
  }
`;

const widthQuery = window.matchMedia(`(min-width: 800px)`);

const PageNavbar = ({selectedNode, goBackVisible = false, onSidebarToggle = null}) => {
    const [sidebarToggleVisible, setSidebarToggleVisible] = useState(!widthQuery.matches);
    const context = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const FeedbackComponent = selectedNode === "feedback" ? SelectedRoute : UiNavbarOption;
    const RoadmapComponent = selectedNode === "roadmap" ? SelectedRoute : UiNavbarOption;
    const ChangelogComponent = selectedNode === "changelog" ? SelectedRoute : UiNavbarOption;
    useEffect(() => {
        const listener = () => setSidebarToggleVisible(!widthQuery.matches);
        widthQuery.addEventListener("change", listener);
        return () => widthQuery.removeEventListener("change", listener);
    }, []);

    const renderChangelogNotificationBubble = () => {
        if (data.lastChangelogUpdate == null) {
            return <React.Fragment/>
        }
        const dateStr = localStorage.getItem("notifs_" + data.id + "_lastChangelogUpdate");
        if (dateStr == null) {
            return <NotificationBubble>1</NotificationBubble>
        }
        const date = Date.parse(dateStr);
        if (date < new Date(data.lastChangelogUpdate)) {
            return <NotificationBubble>1</NotificationBubble>
        }
        return <React.Fragment/>
    };
    return <UiNavbar>
        {goBackVisible && <GoBackButton theme={getTheme().toString()} to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}} aria-label={"Go Back"}>
            <FaChevronLeft className={"ml-2"}/>
        </GoBackButton>}
        <UiContainer className={"d-md-flex d-block"}>
            {onSidebarToggle && sidebarToggleVisible && <ToggleContainer style={{marginRight: 0}}>
                <FaBars style={{color: getTheme().toString(), cursor: "pointer"}} onClick={onSidebarToggle}/>
            </ToggleContainer>}
            <UiNavbarBrand theme={getTheme().toString()} to={{pathname: selectedNode === "feedback" && !goBackVisible ? "/me" : "/b/" + data.discriminator, state: {_boardData: data}}}>
                <img className={"mr-2"} src={data.logo} height={30} width={30} alt={"Board Logo"}/>
                <span className={"align-bottom"}>{data.name}</span>
            </UiNavbarBrand>
            {renderLogIn(onNotLoggedClick, context, getTheme(), data)}
            <div className={"d-md-flex d-block my-md-0 my-2 order-md-1 order-2"} style={{fontWeight: "500", whiteSpace: "nowrap"}}>
                {selectedNode === "admin" &&
                <SelectedRoute to={{pathname: "/ba/" + data.discriminator, state: {_boardData: data}}}
                               theme={getTheme()} border={selectedNode === "admin" ? getTheme().setAlpha(.75) : undefined} aria-label={"Admin Panel"}>
                    <FaRegUser className={"mr-md-2 mr-0 mx-md-0 mx-1"}/>
                    <RouteName>Admin Panel</RouteName>
                </SelectedRoute>
                }
                {selectedNode !== "admin" &&
                <FeedbackComponent to={{pathname: "/b/" + data.discriminator, state: {_boardData: data}}}
                                   theme={getTheme()} border={selectedNode === "feedback" ? getTheme().setAlpha(.75) : undefined} aria-label={"Feedback"}>
                    <FaRegComment className={"mr-md-2 mr-0 mx-md-0 mx-1"}/>
                    <RouteName>Feedback</RouteName>
                </FeedbackComponent>
                }
                {(data.roadmapEnabled && selectedNode !== "admin") &&
                <RoadmapComponent to={{pathname: "/b/" + data.discriminator + "/roadmap", state: {_boardData: data}}}
                                  theme={getTheme()} border={selectedNode === "roadmap" ? getTheme().setAlpha(.75) : undefined} aria-label={"Roadmap"}>
                    <FaRegMap className={"mr-md-2 mr-0 mx-md-0 mx-1"}/>
                    <RouteName>Roadmap</RouteName>
                </RoadmapComponent>
                }
                {(data.changelogEnabled && selectedNode !== "admin") &&
                <React.Fragment>
                    <ChangelogComponent to={{pathname: "/b/" + data.discriminator + "/changelog", state: {_boardData: data}}}
                                        theme={getTheme()} border={selectedNode === "changelog" ? getTheme().setAlpha(.75) : undefined} aria-label={"Changelog"}>
                        <FaRegListAlt className={"mr-md-2 mr-0 mx-md-0 mx-1"}/>
                        <RouteName>Changelog</RouteName>
                        {renderChangelogNotificationBubble()}
                    </ChangelogComponent>
                </React.Fragment>
                }
            </div>
        </UiContainer>
    </UiNavbar>
};

export default PageNavbar;