import styled from "@emotion/styled";
import React from "react";

export const SidebarIcon = styled.div`
  margin-right: .25rem;
  transform: translateY(-2px);
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
      transition: var(--hover-transition);

      &:hover {
        transform: var(--hover-transform-scale-lg);
      }
    }
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