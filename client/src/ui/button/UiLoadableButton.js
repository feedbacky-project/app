import PropTypes from "prop-types";
import React, {useState} from "react";
import tinycolor from "tinycolor2";
import {UiButton} from "ui/button/UiButton";
import {UiLoadingSpinner} from "ui/UiLoadingSpinner";

const UiLoadableButton = (props) => {
    const {children, onClick, ...otherProps} = props;
    const [loading, setLoading] = useState(false);
    return <UiButton disabled={loading} onClick={() => {
        setLoading(true);
        onClick().finally(() => setLoading(false));
    }} {...otherProps}>{loading ? <React.Fragment><UiLoadingSpinner size={"sm"} color={tinycolor("#f2f2f2")} className={"mr-1"}/> <span className={"align-middle"}>{children}</span></React.Fragment> : children}</UiButton>
};

UiLoadableButton.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};

export {UiLoadableButton};