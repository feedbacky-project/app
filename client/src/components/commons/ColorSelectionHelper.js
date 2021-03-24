import styled from "@emotion/styled";
import {WCAG_AA_CONTRAST} from "App";
import React, {Suspense} from "react";
import {ChromePicker} from "react-color";
import {FaExclamationCircle} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiHoverableIcon, UiLoadingSpinner} from "ui";
import {UiFormLabel} from "ui/form";

const ColorPicker = styled(ChromePicker)`
  box-shadow: var(--box-shadow) !important;
  border-radius: var(--border-radius) !important;
  background-color: var(--dark-secondary) !important;
  
  & > div:first-of-type {
    border-radius: var(--border-radius) var(--border-radius) 0 0 !important;
  }
  & > div:last-of-type {
    border-radius: 0 0 var(--border-radius) var(--border-radius) !important;
  }
  
  .dark & {
    box-shadow: var(--dark-box-shadow) !important;
    background-color: var(--dark-secondary) !important;

    & > div {
      background-color: var(--dark-secondary);
    }

    & svg {
      fill: var(--dark-font-color) !important;
    }

    input {
      background-color: var(--dark-quaternary);
      box-shadow: var(--dark-box-shadow) !important;
      color: var(--dark-font-color) !important;
    }
  }
`;

const ColorSelectionHelper = ({title, color, setColor, colorWarning}) => {
    const warn = colorWarning === true ? tinycolor.readability(color, "#fff") < WCAG_AA_CONTRAST || tinycolor.readability(tinycolor(color).clone().lighten(10), "#292c30") < WCAG_AA_CONTRAST : false;
    const textClass = warn ? "text-red" : "";
    return <React.Fragment>
        <UiFormLabel className={textClass}>{title}</UiFormLabel>
        <UiClickableTip id={"colorChooser"} title={"Choose Color"} description={"Choose the color. Avoid too bright and too dark colors, poorly visible in Light and Dark Themes."}/>
        {!warn || <UiClickableTip id={"colorWarn"} title={"Color Warning"} description={"This color is considered either too dark or too bright and might look bad on Light or Dark Mode."}
                                  icon={<UiHoverableIcon as={FaExclamationCircle} className={"text-red align-top ml-1"}/>}/>}
        <br/>
        <Suspense fallback={<UiLoadingSpinner/>}><ColorPicker disableAlpha color={color} onChangeComplete={changedColor => setColor(changedColor.hex)}/></Suspense>
    </React.Fragment>
};

export default ColorSelectionHelper;