import React from 'react';

const LoadingSpinner = ({className = "", size = "lg", style, color}) => {
    let classes = "load-spinner";
    if(size === "sm") {
        classes = "load-spinner-sm";
    }
    classes += " " + className;
    return <svg className={classes} style={style} width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30" stroke={color}/>
    </svg>
};

export default LoadingSpinner;