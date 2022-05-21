import styled from "@emotion/styled";
import React from "react";

export const MobileSidebarIcon = styled.div`
  transform: translateY(-2px);
  width: .8rem;
  height: .8rem;
`;

export const SidebarIcon = styled.div`
  margin-right: .5rem;
  transform: translateY(-2px);
  width: 1rem;
  height: 1rem;
`;

export const Sidebar = styled.div`
  margin-top: 1.5rem;

  ul {
    padding-left: 0;
    margin-bottom: 0.25rem;
    list-style: outside none none;
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 2rem;

    a {
      transition: var(--hover-transition) !important;

      &:hover {
        color: ${props => props.theme} !important;
      }
    }
  }
`;

const SidebarRoute = styled.div`
  color: var(--font-color-75);
  padding: .25rem 1rem;
  margin: .25rem 0;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: normal;
  transition: var(--hover-transition);

  ${props => props.selected && `
    font-weight: bold;
    background-color: var(--background);
    color: ${props.theme};
    
    .dark & {
        background-color: var(--tertiary);
    }
  `}
  &:hover {
    background-color: var(--background);
    .dark & {
      background-color: var(--tertiary);
    }
  }
`;

export const SidebarToggler = styled.div`
  position: absolute;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--background);
  display: flex;
  cursor: pointer;
  z-index: 1000;
  transition: var(--hover-transition);

  ${props => props.open ? ` left: 224px; top: 30px;` : `left: 0px; top: 30px;`}
  &:hover {
    background-color: var(--tertiary);
  }
`;

export const renderSidebarRoutes = (routes, themeColor, currentNode, reRouteTo) => {
    return routes.map((val, i) => {
        const key = Object.keys(val)[0];
        const highlight = currentNode === key ? {color: themeColor} : {color: "inherit"};
        const valueFunc = Object.values(val)[0];
        return <li key={i}>
            <a href={"#!"} onClick={() => reRouteTo(key)} style={highlight}>
                {valueFunc(highlight)}
            </a>
        </li>
    });
};

export const renderAdminSidebarRoutes = (routes, themeColor, currentNode, reRouteTo) => {
    return routes.map((val, i) => {
        const key = Object.keys(val)[0];
        const highlight = currentNode === key ? {color: themeColor} : {color: "inherit"};
        const valueFunc = Object.values(val)[0];
        return <SidebarRoute key={i} theme={themeColor} selected={currentNode === key} onClick={() => reRouteTo(key)}>
            {valueFunc(highlight)}
        </SidebarRoute>
    });
};