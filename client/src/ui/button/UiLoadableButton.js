import styled from "@emotion/styled";
import {LIGHT_THEME_COLOR} from "AppAppearance";
import PropTypes from "prop-types";
import React, {useContext, useState} from "react";
import tinycolor from "tinycolor2";
import {UiButton} from "ui/button/UiButton";
import {UiThemeContext} from "ui/index";
import {UiLoadingSpinner} from "ui/UiLoadingSpinner";

const Loadable = styled(UiLoadingSpinner)`
    position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
`

const Top = styled(UiButton)`
    position: relative;
`

const UiLoadableButton = (props) => {
    const {children, onClick, ...otherProps} = props;
    const [loading, setLoading] = useState(false);
    const {darkMode} = useContext(UiThemeContext);
    const darkModeColor = tinycolor("#f2f2f2");
    const lightModeColor = tinycolor(LIGHT_THEME_COLOR);

    return <Top disabled={loading} onClick={() => {
        setLoading(true);
        onClick().finally(() => setLoading(false));
    }} {...otherProps}>{loading ? <React.Fragment>
        <Loadable size={"sm"} color={darkMode ? darkModeColor : lightModeColor}/>
        <span style={{visibility: "hidden"}}>{children}</span>
    </React.Fragment> : children}</Top>
};

UiLoadableButton.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};

export {UiLoadableButton};