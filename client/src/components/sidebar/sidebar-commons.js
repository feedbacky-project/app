import React from "react";

export const renderSidebarRoutes = (routes, themeColor, currentNode, reRouteTo) => {
    return routes.map((val, i) => {
        const key = Object.keys(val)[0];
        const highlight = currentNode === key ? {color: themeColor} : {color: "inherit"};
        const highlightIcon = currentNode === key ? {color: themeColor} : {color: "inherit"};
        const valueFunc = Object.values(val)[0];
        return <li key={i}>
            <a href="#!" onClick={() => reRouteTo(key)} style={highlight}>
                {valueFunc(highlightIcon)}
            </a>
        </li>
    });
};