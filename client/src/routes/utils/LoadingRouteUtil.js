import React from "react";
import {UiLoadingSpinner} from "ui";
import {UiRow} from "ui/grid";

const LoadingRouteUtil = () => {
    return <UiRow centered verticallyCentered><UiLoadingSpinner/></UiRow>
};

export default LoadingRouteUtil;