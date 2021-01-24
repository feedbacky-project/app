import React, {useContext} from 'react';
import AppContext from "../../context/app-context";

const LoadingSpinner = ({className = "", size = "lg", customSize, color = null}) => {
    const context = useContext(AppContext);
    let defaultColor;
    if(context.user.darkMode) {
        defaultColor = "#f2f2f2";
    } else {
        defaultColor = "#4285F4";
    }
    let sizePx = 40;
    if(size === "sm") {
        sizePx = 18;
    }
    return <svg className={"load-spinner " + className} style={{width: customSize || sizePx, height: customSize || sizePx}} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30" stroke={color || defaultColor}/>
    </svg>
};

export default LoadingSpinner;