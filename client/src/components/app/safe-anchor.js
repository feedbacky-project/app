import React from "react";
import PropTypes from "prop-types";

const SafeAnchor = ({url, children}) => {
    return <a href={url} target="_blank" rel="noreferrer noopener">{children}</a>
};

export default SafeAnchor;

SafeAnchor.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired
};