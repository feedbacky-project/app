import PropTypes from "prop-types";
import LoadingSpinner from "components/util/loading-spinner";
import React from "react";

const ComponentLoader = ({loaded, loader = <LoadingSpinner/>, component}) => {
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