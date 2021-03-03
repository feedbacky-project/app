import {LIGHT_THEME_COLOR} from "AppAppearance";
import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext, useState} from "react";
import tinycolor from "tinycolor2";
import {UiButton} from "ui/button/UiButton";
import {UiLoadingSpinner} from "ui/UiLoadingSpinner";

const UiLoadableButton = (props) => {
    const {children, onClick, ...otherProps} = props;
    const [loading, setLoading] = useState(false);
    const {user} = useContext(AppContext);
    const darkModeColor = tinycolor("#f2f2f2");
    const lightModeColor = tinycolor(LIGHT_THEME_COLOR);
    return <UiButton disabled={loading} onClick={() => {
        setLoading(true);
        onClick().finally(() => setLoading(false));
    }} {...otherProps}>{loading ? <React.Fragment>
        <UiLoadingSpinner size={"sm"} color={user.darkMode ? darkModeColor : lightModeColor} className={"mr-1"}/>
        <span className={"align-middle"}>{children}</span>
    </React.Fragment> : children}</UiButton>
};

UiLoadableButton.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};

export {UiLoadableButton};