import React, {useState} from "react";
import {UiButton} from "ui/button/UiButton";
import {UiLoadingSpinner} from "ui/UiLoadingSpinner";
import tinycolor from "tinycolor2";

const UiLoadableButton = (props) => {
    const {children, onClick, className = null, ...otherProps} = props;
    const [loading, setLoading] = useState(false);
    return <UiButton className={className} disabled={loading} onClick={() => {
        setLoading(true);
        onClick().finally(() => setLoading(false));
    }} {...otherProps}>{loading ? <React.Fragment><UiLoadingSpinner size={"sm"} color={tinycolor("#f2f2f2")} className={"mr-1"}/> <span className={"align-middle"}>{children}</span></React.Fragment> : children}</UiButton>
};

export {UiLoadableButton};