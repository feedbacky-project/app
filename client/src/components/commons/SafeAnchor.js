import PropTypes from "prop-types";
import React from "react";

const SafeAnchor = ({url, className, children}) => {
    return <a href={url} className={className} target={"_blank"} rel={"noreferrer noopener"}>{children}</a>
};

export default SafeAnchor;

SafeAnchor.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired
};