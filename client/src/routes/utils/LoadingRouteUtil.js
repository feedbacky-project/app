import React, {useEffect} from "react";
import {UiLoadingSpinner} from "ui";
import {UiRow} from "ui/grid";
import {popupWarning} from "utils/basic-utils";

const LoadingRouteUtil = () => {
    useEffect(() => {
        let number = 4;
        let timeoutTimer = setInterval(() => {
            number++;
            let message;
            if (number % 5 === 0) {
                message = "Looks like content doesn't want to load...";
            } else if (number % 5 === 1) {
                message = "You shouldn't see this unless API is down or slow to respond.";
            } else if (number % 5 === 2) {
                message = "Did you know that Feedbacky was initially made for private needs?";
            } else if (number % 5 === 3) {
                message = "Did you know that you can access hidden UI test page at /-/ui-test";
            } else if (number % 5 === 4) {
                message = "In case you're bored just refresh the page.";
            }
            popupWarning(message);
        }, 6000 + (number * 250));
        return () => clearInterval(timeoutTimer);
    }, []);
    return <UiRow centered verticallyCentered><UiLoadingSpinner className={"default-color"}/></UiRow>
};

export default LoadingRouteUtil;
