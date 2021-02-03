import UndrawChooseTheme from "assets/svg/undraw/choose_theme.svg";
import SetupImageBanner from "components/board/admin/SetupImageBanner";
import React, {Suspense} from 'react';
import {CirclePicker} from "react-color";
import {UiLoadingSpinner} from "ui";
import {UiCol} from "ui/grid";

const StepThirdSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <SetupImageBanner svg={UndrawChooseTheme} stepName={"Select Theme"} stepDescription={"Pick theme for your board. Theme will affect how your board looks."}/>
        <UiCol xs={12} className={"mt-4 px-3"}>
            <Suspense fallback={<UiLoadingSpinner/>}>
                <CirclePicker colors={["#273c75", "#2c3e50", "#8e44ad", "#B33771",
                    "#d35400", "#e74c3c", "#706fd3", "#218c74",
                    "#2980b9", "#16a085", "#e67e22", "#27ae60",
                    "#44bd32", "#1B9CFC", "#3498db", "#EE5A24"]}
                              className={"color-picker-admin mx-auto"} color={settings.themeColor} circleSpacing={4}
                              onChangeComplete={color => updateSettings({...settings, themeColor: color.hex})}/>
            </Suspense>
        </UiCol>
    </React.Fragment>
};

export default StepThirdSubroute;