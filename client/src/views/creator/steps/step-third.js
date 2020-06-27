import React, {Suspense} from 'react';
import {Col} from "react-bootstrap";
import LoadingSpinner from "components/util/loading-spinner";
import {CirclePicker} from "react-color";
import UndrawChooseTheme from "assets/svg/undraw/choose_theme.svg";

const StepThird = ({updateSettings, settings}) => {
    return <React.Fragment>
        <Col xs={12} className="mt-4 text-center">
            <img alt="" src={UndrawChooseTheme} className="my-2" width={150} height={150}/>
            <h2>Select Theme</h2>
            <span className="text-black-60">
                Pick theme for your board. This is how your page elements will looks like.
            </span>
        </Col>
        <Col xs={12} className="mt-4 px-md-5 px-3">
            <Suspense fallback={<LoadingSpinner/>}>
                <CirclePicker colors={["#202428", "#2d3436", "#2c3e50", "#d35400", "#e74c3c", "#e67e22", "#8e44ad", "#2980b9", "#3498db", "#f39c12", "#f1c40f", "#27ae60", "#2ecc71", "#16a085", "#1abc9c", "#95a5a6"]}
                              className="text-center color-picker-admin mx-auto" color={settings.theme} circleSpacing={4}
                              onChangeComplete={color => updateSettings({...settings, themeColor: color.hex})}/>
            </Suspense>
        </Col>
    </React.Fragment>
};

export default StepThird;