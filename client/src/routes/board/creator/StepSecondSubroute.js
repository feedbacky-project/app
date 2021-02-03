import UndrawBrandProject from "assets/svg/undraw/brand_project.svg";
import {Banner} from "components/board/BoardBanner";
import UploadIconBox from "components/commons/UploadIconBox";
import React from 'react';
import {UiClickableTip} from "ui";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
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
            <UiFormLabel>Board Banner</UiFormLabel>
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
            <Banner image={settings.banner || "https://cdn.feedbacky.net/static/img/main-background.png"} id={"boardBanner"} className={"mb-2"}
                    onClick={() => document.getElementById("bannerInput").click()}>
                <h3 style={{color: "transparent"}}>Example Board</h3>
                <h5 style={{color: "transparent"}}>Description of board</h5>
                <UploadIconBox/>
            </Banner>
            <input hidden accept={"image/jpeg, image/png"} id={"bannerInput"} type={"file"} name={"banner"} onChange={e => onBannerChange(e)}/>
        </UiCol>
        <UiCol xs={12} sm={6} className={"mt-4 px-md-5 px-3"}>
            <UiFormLabel>Board Logo</UiFormLabel>
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
            <div style={{position: "relative", maxWidth: 200}} onClick={() => document.getElementById("logoInput").click()}>
                <img alt={"logo"} src={settings.logo || "https://cdn.feedbacky.net/static/img/logo.png"} id={"boardLogo"} className={"mb-2"} width={200} height={200}/>
                <UploadIconBox/>
            </div>
            <input hidden accept={"image/jpeg, image/png"} id={"logoInput"} type={"file"} name={"logo"} onChange={e => onLogoChange(e)}/>
        </UiCol>
    </React.Fragment>
};

export default StepSecondSubroute;