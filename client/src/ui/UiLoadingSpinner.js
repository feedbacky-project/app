import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from 'react';

const UiLoadingSpinner = (props) => {
    const {getTheme} = useContext(AppContext);
    const {size = "lg", className = "", customSize, color = getTheme()} = props;
    let sizePx = 40;
    if (size === "sm") {
        sizePx = 18;
    }
    return <svg className={"load-spinner " + className} style={{width: customSize || sizePx, height: customSize || sizePx}} viewBox={"0 0 66 66"} xmlns={"http://www.w3.org/2000/svg"}>
        <circle className={"path"} fill={"none"} strokeWidth={6} strokeLinecap={"round"} cx={33} cy={33} r={30} stroke={color}/>
    </svg>
};

UiLoadingSpinner.propTypes = {
    size: PropTypes.string,
    customSize: PropTypes.number
};

export {UiLoadingSpinner};