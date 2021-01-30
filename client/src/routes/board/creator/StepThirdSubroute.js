import UndrawChooseTheme from "assets/svg/undraw/choose_theme.svg";
import React, {Suspense} from 'react';
import {CirclePicker} from "react-color";
import {UiLoadingSpinner} from "ui";
import {UiCol} from "ui/grid";

const StepThirdSubroute = ({updateSettings, settings}) => {
    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawChooseTheme} className={"my-2"} width={150} height={150}/>
            <h2>Select Theme</h2>
            <span className={"text-black-60"}>
                Pick theme for your board. This is how your page elements will looks like.
            </span>
        </UiCol>
        <UiCol xs={12} className={"mt-4 px-md-5 px-3"}>
            <Suspense fallback={<UiLoadingSpinner/>}>
                <CirclePicker colors={["#273c75", "#2c3e50", "#8e44ad", "#B33771",
                    "#d35400", "#e74c3c", "#706fd3", "#218c74",
                    "#2980b9", "#16a085", "#e67e22", "#27ae60",
                    "#44bd32", "#1B9CFC", "#3498db", "#EE5A24"]}
                              className={"text-center color-picker-admin mx-auto"} color={settings.themeColor} circleSpacing={4}
                              onChangeComplete={color => updateSettings({...settings, themeColor: color.hex})}/>
            </Suspense>
        </UiCol>
    </React.Fragment>
};

export default StepThirdSubroute;