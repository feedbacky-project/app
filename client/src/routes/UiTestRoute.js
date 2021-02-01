import BoardBanner from "components/board/BoardBanner";
import BoardNavbar from "components/board/BoardNavbar";
import IdeaNavbar from "components/idea/IdeaNavbar";
import ProfileNavbar from "components/profile/ProfileNavbar";
import AppContext from "context/AppContext";
import IdeaContext from "context/IdeaContext";
import {Step} from "rc-steps";
import React, {useContext, useEffect} from "react";
import {FaCogs} from "react-icons/all";
import BoardContextedRouteUtil from "routes/utils/BoardContextedRouteUtil";
import tinycolor from "tinycolor2";
import {UiBadge, UiClickableTip, UiLoadingSpinner, UiPrettyUsername, UiProgressBar} from "ui";
import {UiButton, UiCancelButton, UiClassicButton, UiElementDeleteButton, UiLoadableButton, UiNextStepButton, UiPreviousStepButton} from "ui/button";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiCountableFormControl, UiFormControl} from "ui/form";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {UiAvatar, UiImage} from "ui/image";
import {UiNavbar} from "ui/navbar";
import {UiViewBox} from "ui/viewbox";
import {toastSuccess} from "utils/basic-utils";

const UiTestRoute = () => {
    const context = useContext(AppContext);
    useEffect(() => {
            document.getElementById("loadable").click();
            context.onThemeChange("#8e44ad");
        }, //eslint-disable-next-line
        []);
    const customTheme = tinycolor("#e74c3c");
    const themes = ["#c0392b", "#9b59b6", "#16a085", "#2980b9"];
    return <BoardContextedRouteUtil board={{
        data: {
            name: "Test Board", discriminator: "test", shortDescription: "UI test Feedbacky", logo: "https://cdn.feedbacky.net/static/img/logo.png",
            banner: "https://cdn.feedbacky.net/static/img/main_banner_dark.png", socialLinks: [], suspendedUsers: [], moderators: [{userId: context.user.data.id, user: context.user.data, role: "MODERATOR"}]
        }, loaded: true, error: false
    }} setBoard={() => void 0}>
        <IdeaContext.Provider value={{ideaData: {}, loaded: true, error: false, updateState: () => void 0}}>
            <ProfileNavbar/>
            <UiNavbar>
                <div>Plain navbar</div>
            </UiNavbar>
            <BoardNavbar/>
            <IdeaNavbar/>
            <div style={{position: "fixed", zIndex: 1000, left: "15px", top: "50%", width: 150, borderRadius: ".35rem", backgroundColor: "#2d2d2d"}}>
                <UiContainer className={"py-2 justify-content-center"}>
                    <div style={{textAlign: "center", marginBottom: ".5rem", color: "white"}}>Debug Card</div>
                    <UiButton size={"sm"} className={"my-1"} onClick={() => context.onAppearanceToggle()}>Dark Mode</UiButton>
                    <UiButton size={"sm"} className={"my-1"} onClick={() => context.onThemeChange(themes[Math.floor(Math.random() * themes.length)])}>Random Theme</UiButton>
                    <UiButton size={"sm"} className={"my-1"} onClick={() => toastSuccess("Toast test")}>Toast Test</UiButton>
                </UiContainer>
            </div>
            <UiContainer>
                <UiRow className={"mt-5"}>
                    <BoardBanner/>
                    <UiCol xs={12} className={"my-3"}>
                        <UiButton className={"mx-2"}>Test</UiButton>
                        <UiButton className={"mx-2"} color={customTheme}>Colored</UiButton>
                        <UiCancelButton className={"mx-2"}>TestCancel</UiCancelButton>
                        <UiLoadableButton id={"loadable"} className={"mx-2"} onClick={() => new Promise(resolve => setTimeout(void 0, 1000))}>Loading</UiLoadableButton>
                        <UiClassicButton className={"mx-2"}>Classic</UiClassicButton>

                        <UiElementDeleteButton tooltipName={"Delete Btn"} onClick={() => void 0} id={"elDel"}/>
                        <UiNextStepButton nextStep={() => void 0}/>
                        <UiPreviousStepButton previousStep={() => void 0}/>
                    </UiCol>
                    <UiCol xs={12} className={"my-3"}>
                        <UiLoadingSpinner className={"mx-2"}/>
                        <UiLoadingSpinner className={"mx-2"} customSize={25}/>
                        <UiLoadingSpinner className={"mx-2"} color={customTheme} customSize={15}/>

                        <UiPrettyUsername className={"mx-2"} user={context.user.data}/>
                        <UiPrettyUsername className={"mx-2"} user={context.user.data} truncate={3}/>
                        <UiClickableTip className={"mx-2"} id={"tip"} title={"Title"} description={"Desc"}/>
                        <UiClickableTip className={"mx-2"} id={"tip"} title={"Title"} description={"Desc"} icon={<FaCogs/>}/>
                    </UiCol>
                    <UiCol xs={12} className={"my-3"}>
                        <UiBadge className={"mx-2"}>Test</UiBadge>
                        <UiBadge className={"mx-2"} color={customTheme}>Colored</UiBadge>
                    </UiCol>
                    <UiCol as={UiRow} xs={12}>
                        <UiCol xs={12} md={6}>
                            <UiViewBox description={"ViewDescription"} title={"ViewTitle"}>
                                <UiCol>
                                    Content test content test
                                </UiCol>
                            </UiViewBox>
                        </UiCol>
                        <UiCol xs={12} md={6}>
                            <UiViewBox description={"ViewDescription Colored"} title={"ViewTitle Colored"} theme={customTheme}>
                                <UiCol>
                                    Content test content test
                                </UiCol>
                            </UiViewBox>
                        </UiCol>
                    </UiCol>
                    <UiCol xs={12} className={"my-3"}>
                        <UiProgressBar currentStep={2} steps={4}>
                            <Step title={"Concept"}/>
                            <Step title={"Code"}/>
                            <Step title={"Test"}/>
                            <Step title={"Release"} state={"finish"}/>
                        </UiProgressBar>
                    </UiCol>
                    <UiCol xs={12} md={6} className={"my-3"}>
                        <UiFormControl placeholder={"Example form"} maxLength={15} id={"form1"}/>
                    </UiCol>
                    <UiCol xs={12} md={6} className={"my-3"}>
                        <UiCountableFormControl placeholder={"Example form"} defaultValue={"hello default value maxLength 99"} maxLength={99} id={"form2"}/>
                    </UiCol>
                    <UiCol xs={12} md={6} className={"my-3"}>
                        <UiAvatar className={"mx-2"} user={context.user.data} size={120}/>
                        <UiAvatar className={"mx-2"} user={context.user.data} size={90} rounded/>
                        <UiAvatar className={"mx-2"} user={context.user.data} size={60} roundedCircle/>
                    </UiCol>
                    <UiCol xs={12} md={6} className={"my-3"}>
                        <UiImage className={"mx-2"} src={"https://static.plajer.xyz/avatar/generator.php?name=Plajer"} width={128} height={128}/>
                        <UiImage className={"mx-2"} src={"https://static.plajer.xyz/avatar/generator.php?name=Feedbacky"} rounded width={64} height={64}/>
                        <UiImage className={"mx-2"} src={"https://static.plajer.xyz/avatar/generator.php?name=Generator"} roundedCircle width={32} height={32}/>
                    </UiCol>
                    <UiCol xs={12} className={"my-3"}>
                        <UiSelectableDropdown values={<React.Fragment><UiDropdownElement>Test</UiDropdownElement><UiDropdownElement>Second</UiDropdownElement></React.Fragment>}
                                              currentValue={"Test Dropdown"} id={"selectDropdown"}/>
                    </UiCol>
                </UiRow>
            </UiContainer>
        </IdeaContext.Provider>
    </BoardContextedRouteUtil>
};

export default UiTestRoute;