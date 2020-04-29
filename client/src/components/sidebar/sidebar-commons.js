import React from "react";

export const renderSidebarRoutes = (routes, themeColor, currentNode, reRouteTo) => {
    return routes.map((val, i) => {
        const key = Object.keys(val)[0];
        const highlight = currentNode === key ? {color: themeColor} : {};
        const highlightIcon = currentNode === key ? {color: themeColor} : {color: "rgba(0,0,0,.5) !important"};
        return <li key={i}>
            <a href="#!" onClick={() => reRouteTo(key)} style={highlight}>
                {Object.values(val)[0](highlightIcon)}
            </a>
        </li>
    });
};