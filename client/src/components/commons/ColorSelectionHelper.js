import React, {Suspense} from "react";
import Form from "react-bootstrap/Form";
import {ChromePicker} from "react-color";
import {FaExclamationCircle} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiLoadingSpinner} from "ui";

const ColorSelectionHelper = ({title, color, setColor, colorWarning}) => {
    const warn = colorWarning === true ? tinycolor.readability(color, "#fff") < 2.0 || tinycolor.readability(tinycolor(color).lighten(10), "#292c30") < 2.0 : false;
    const textClass = warn ? "text-danger" : "text-black-60";
    return <React.Fragment>
        <Form.Label className={"mr-1 " + textClass}>{title}</Form.Label>
        <UiClickableTip id={"colorChooser"} title={"Choose Color"} description={"Choose the color. Avoid too bright and too dark colors, poorly visible in Light and Dark Themes."}/>
        {!warn || <UiClickableTip id={"colorWarn"} title={"Color Warning"} description={"This color is considered either too dark or too bright and might look bad on Light or Dark Mode."}
                                  icon={<FaExclamationCircle className={"fa-xs text-danger align-top ml-1 hoverable-option"}/>}/>}
        <br/>
        <Suspense fallback={<UiLoadingSpinner/>}>
            <ChromePicker className={"text-center"} disableAlpha color={color} onChangeComplete={changedColor => setColor(changedColor.hex)}/>
        </Suspense>
    </React.Fragment>
};

export default ColorSelectionHelper;