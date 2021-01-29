import UndrawBrandProject from "assets/svg/undraw/brand_project.svg";
import React from 'react';
import {Form} from "react-bootstrap";
import UiCol from "ui/grid/UiCol";
import UiClickableTip from "ui/UiClickableTip";
import {getBase64FromFile, validateImageWithWarning} from "utils/basic-utils";

const StepSecondSubroute = ({updateSettings, settings}) => {
    const onLogoChange = (e) => {
        if (!validateImageWithWarning(e, "logoInput", 250)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            document.getElementById("boardLogo").setAttribute("src", data);
            updateSettings({...settings, logo: data});
        });
    };
    const onBannerChange = (e) => {
        if (!validateImageWithWarning(e, "bannerInput", 650)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            document.getElementById("boardBanner").style["background-image"] = "url('" + data + "')";
            updateSettings({...settings, banner: data});
        });
    };
    return <React.Fragment>
        <UiCol xs={12} className={"mt-4 text-center"}>
            <img alt={"Banner"} src={UndrawBrandProject} className={"my-2"} width={150} height={150}/>
            <h2>Brand Your Board</h2>
            <span className={"text-black-60"}>
                Upload your board logo and banner. This step is required.
            </span>
        </UiCol>
        <UiCol xs={12} sm={6} className={"mt-4 px-md-5 px-3"}>
            <Form.Label className={"mr-1 text-black-60"}>Board Banner</Form.Label>
            <UiClickableTip id={"banner"} title={"Set Board Banner"} description={<React.Fragment>
                Upload your board banner.
                <br/>
                <strong>
                    Maximum size 650 kb, png and jpg only.
                    <br/>
                    Suggested size: 1120x400
                </strong>
            </React.Fragment>}/>
            <br/>
            {/* simulate real board jumbotron to show properly sized image */}
            <div id={"boardBanner"} className={"jumbotron mb-2"} style={{backgroundImage: `url("` + settings.banner + `")`}}>
                <h3 style={{color: "transparent"}}>Example Board</h3>
                <h5 style={{color: "transparent"}}>Descriptive example Board</h5>
            </div>
            <input className={"small"} accept={"image/jpeg, image/png"} id={"bannerInput"} type={"file"} name={"banner"} onChange={e => onBannerChange(e)}/>
        </UiCol>
        <UiCol xs={12} sm={6} className={"mt-4 px-md-5 px-3"}>
            <Form.Label className={"mr-1 text-black-60"}>Board Logo</Form.Label>
            <UiClickableTip id={"logo"} title={"Set Board Logo"} description={<React.Fragment>
                Upload your board logo.
                <br/>
                <strong>
                    Maximum size 250 kb, png and jpg only.
                    <br/>
                    Suggested size: 100x100
                </strong>
            </React.Fragment>}/>
            <br/>
            <img alt={"logo"} src={settings.logo} id={"boardLogo"} className={"mb-2"} width={50} height={50}/>
            <br/>
            <input className={"small"} accept={"image/jpeg, image/png"} id={"logoInput"} type={"file"} name={"logo"} onChange={e => onLogoChange(e)}/>
        </UiCol>
    </React.Fragment>
};

export default StepSecondSubroute;