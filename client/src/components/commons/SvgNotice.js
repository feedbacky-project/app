import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";

export const SvgNotice = ({Component, title, description}) => {
    const {getTheme} = useContext(AppContext);
    return <div className={"text-center mt-3"}>
        <Component style={{maxWidth: 150, maxHeight: 120, color: getTheme()}}/>
        <div>
            <strong style={{fontSize: "1.1rem"}}>{title}</strong>
            <br/>
            {!description || <span className={"text-black-60"}>{description}</span>}
        </div>
    </div>
};

SvgNotice.propTypes = {
    Component: PropTypes.object.isRequired,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
    description: PropTypes.string,
};