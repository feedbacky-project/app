import React, {useContext} from "react";
import AppContext from "context/app-context";
import PropTypes from "prop-types";

export const SvgNotice = ({Component, title, description}) => {
    const context = useContext(AppContext);
    return <div className="text-center mt-3">
        <Component style={{maxWidth: 150, maxHeight: 120, color: context.getTheme()}}/>
        <div>
            <strong style={{fontSize: "1.1rem"}}>{title}</strong>
            <br/>
            {!description || <span className="text-black-60">{description}</span>}
        </div>
    </div>
};

SvgNotice.propTypes = {
    Component: PropTypes.object.isRequired,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
    description: PropTypes.string,
};