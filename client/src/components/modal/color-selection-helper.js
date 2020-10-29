import ClickableTip from "components/util/clickable-tip";
import {FaExclamationCircle} from "react-icons/all";
import React, {Suspense} from "react";
import LoadingSpinner from "components/util/loading-spinner";
import {ChromePicker} from "react-color";
import Form from "react-bootstrap/Form";
import tinycolor from "tinycolor2";

const ColorSelectionHelper = ({title, color, setColor, colorWarning}) => {
    const warn = colorWarning === true ? tinycolor.readability(color, "#fff") < 2.0 || tinycolor.readability(tinycolor(color).lighten(10), "#292c30") < 2.0 : false;
    const textClass = warn ? "text-danger" : "text-black-60";
    return <React.Fragment>
        <Form.Label className={"mr-1 " + textClass}>{title}</Form.Label>
        <ClickableTip id="colorChooser" title="Choose Color" description="Choose the color. Avoid too bright and too dark colors, poorly visible in Light and Dark Themes."/>
        {!warn || <ClickableTip id="colorWarn" title="Color Warning" description="This color is considered either too dark or too bright and might look bad on Light or Dark Mode."
                                        icon={<FaExclamationCircle className="fa-xs text-danger move-top-1px ml-1 hoverable-option"/>}/>}
        <br/>
        <Suspense fallback={<LoadingSpinner/>}>
            <ChromePicker className="text-center" disableAlpha color={color} onChangeComplete={changedColor => setColor(changedColor.hex)}/>
        </Suspense>
    </React.Fragment>
};

export default ColorSelectionHelper;