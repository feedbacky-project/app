import styled from "@emotion/styled";
import {WCAG_AA_CONTRAST} from "App";
import {BoardContext} from "context";
import React, {Suspense, useContext} from "react";
import {ChromePicker} from "react-color";
import {FaExclamationCircle, FaExclamationTriangle} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiHoverableIcon, UiLoadingSpinner} from "ui";
import {UiFormLabel} from "ui/form";

const ColorPicker = styled(ChromePicker)`
  box-shadow: var(--box-shadow) !important;
  border-radius: var(--border-radius) !important;
  background-color: var(--secondary) !important;

  & > div:first-of-type {
    border-radius: var(--border-radius) var(--border-radius) 0 0 !important;
  }

  & > div:last-of-type {
    border-radius: 0 0 var(--border-radius) var(--border-radius) !important;
  }

  .dark & {
    & > div {
      background-color: var(--secondary);
    }

    & svg {
      fill: var(--font-color) !important;
    }

    input {
      background-color: var(--quaternary);
      box-shadow: var(--box-shadow) !important;
      color: var(--font-color) !important;
    }
  }
`;

const ColorThemeShowcaseBox = styled.div`
  font-weight: bold;
  border-radius: var(--border-radius);
  text-align: center;
  display: inline-block;
  padding: 0 1rem;
`;

const ColorSelectionHelper = ({title, color, setColor, colorWarning}) => {
    const warn = colorWarning === true ? tinycolor.readability(color, "#fff") < WCAG_AA_CONTRAST || tinycolor.readability(tinycolor(color).clone().lighten(10), "#292c30") < WCAG_AA_CONTRAST : false;
    const textClass = warn ? "text-red" : "";
    const {data: boardData} = useContext(BoardContext);

    return <React.Fragment>
        <UiFormLabel className={textClass}>{title}</UiFormLabel>
        <UiClickableTip id={"colorChooser"} title={"Choose Color"} description={"Choose the color. Avoid too bright and too dark colors, poorly visible in Light and Dark Themes."}/>
        {!warn || <UiClickableTip id={"colorWarn"} title={"Color Warning"} description={"This color is considered either too dark or too bright and might look bad on Light or Dark Mode."}
                                  icon={<UiHoverableIcon as={FaExclamationCircle} className={"text-red align-top ml-1"}/>}/>}
        <br/>
        <Suspense fallback={<UiLoadingSpinner/>}><ColorPicker disableAlpha color={color} onChangeComplete={changedColor => setColor(changedColor.hex)}/></Suspense>
        <small>
            <div className={"mt-1"}>
                <FaExclamationTriangle className={"text-red move-top-1px"}/> <strong className={"text-red"}>Heads up!</strong> Some colors are <strong>hard to read</strong> in light or dark mode.
            </div>
            <div className={"mt-1"}>Light Mode Example:</div>
            <ColorThemeShowcaseBox style={{backgroundColor: "hsl(210, 15%, 94%)", color}}>
                <img alt={"Logo"} src={boardData.logo} width={16} height={16}/> {boardData.name}
            </ColorThemeShowcaseBox>
            <div className={"mt-1"}>Dark Mode Example:</div>
            <ColorThemeShowcaseBox style={{backgroundColor: "hsl(214, 8%, 17%)", color}}>
                <img alt={"Logo"} src={boardData.logo} width={16} height={16}/> {boardData.name}
            </ColorThemeShowcaseBox>
        </small>
    </React.Fragment>
};

export default ColorSelectionHelper;