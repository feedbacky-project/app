import UndrawChooseTheme from "assets/svg/undraw/choose_theme.svg";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import ColorPickerContainer from "components/commons/ColorPickerContainer";
import React, {Suspense} from 'react';
import {UiLoadingSpinner} from "ui";
import {UiCol} from "ui/grid";

const StepThirdSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <SetupImageBanner svg={UndrawChooseTheme} stepName={"Select Theme"} stepDescription={"Pick theme for your board. Theme will affect how your board looks."}/>
        <UiCol xs={12} className={"mt-4 px-3"}>
            <Suspense fallback={<UiLoadingSpinner/>}>
                <ColorPickerContainer className={"mx-auto"} color={settings.themeColor} onChange={color => updateSettings({...settings, themeColor: color.hex})}/>
            </Suspense>
        </UiCol>
    </React.Fragment>
};

export default StepThirdSubroute;