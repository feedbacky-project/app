import PropTypes from "prop-types";
import React from "react";
import {UiLoadingSpinner} from "ui";

const ComponentLoader = ({loaded, loader = <UiLoadingSpinner/>, component}) => {
    if (!loaded) {
        return loader;
    }
    return component;
};

ComponentLoader.propTypes = {
    loaded: PropTypes.bool.isRequired,
    loader: PropTypes.object,
    component: PropTypes.object.isRequired
};

export default ComponentLoader;