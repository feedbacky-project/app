import React, {useState} from "react";
import {UiButton} from "ui/button/UiButton";
import {UiLoadingSpinner} from "ui/UiLoadingSpinner";
const UiLoadableButton = ({children, color, onClick, size, style = null, className = null}) => {
    const [loading, setLoading] = useState(false);
    return <UiButton color={color} size={size} className={className || "m-0 mt-sm-0 mt-2"} style={style} disabled={loading} onClick={() => {
        setLoading(true);
        onClick().finally(() => setLoading(false));
    }}>{loading ? <React.Fragment><UiLoadingSpinner size={"sm"} color={"#f2f2f2"} className={"mr-1"}/> <span className={"align-middle"}>{children}</span></React.Fragment> : children}</UiButton>
};

export {UiLoadableButton};