import styled from "@emotion/styled";
import axios from "axios";
import ThemeSelectionModal from "components/board/admin/ThemeSelectionModal";
import {Banner} from "components/board/BoardBanner";
import ColorPickerContainer from "components/commons/ColorPickerContainer";
import ConfirmationActionModal from "components/commons/ConfirmationActionModal";
import DangerousActionModal from "components/commons/DangerousActionModal";
import UploadIconBox from "components/commons/UploadIconBox";
import {CommentInternal} from "components/idea/discussion/CommentsBox";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import React, {Suspense, useContext, useEffect, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {FaEllipsisH, FaEyeSlash} from "react-icons/all";
import {useHistory} from "react-router-dom";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiKeyboardInput, UiLoadingSpinner} from "ui";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiCountableFormControl, UiFormControl, UiFormLabel, UiFormText} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {UiViewBoxDangerBackground} from "ui/viewbox/UiViewBox";
import {formatRemainingCharacters, getBase64FromFile, htmlDecode, popupError, popupNotification, validateImageWithWarning} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const ThemeSelector = styled.div`
  width: 28px;
  height: 28px;
  margin-right: 4px;
  margin-top: 4px;
  transition: var(--hover-transition);
  
  &:hover {
    transform: var(--hover-transform-scale-lg);
  }
`;

export const ApiKeyIcon = styled(FaEyeSlash)`
  color: hsl(210, 100%, 50%);
  
  .dark & {
    color: hsl(210, 100%, 60%);
  }
`;

const ApiKeyElement = styled.span`
  transition: var(--hover-transition);
`;

const GeneralSubroute = ({updateState}) => {
    const history = useHistory();
    const {onThemeChange, getTheme, user} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const [anonymousVoting, setAnonymousVoting] = useState(boardData.anonymousAllowed);
    const [apiKeyBlurred, setApiKeyBlurred] = useState(true);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [modal, setModal] = useState({open: false, type: ""});
    const [bannerInput, setBannerInput] = useState(null);
    const [logoInput, setLogoInput] = useState(null);
    useEffect(() => setCurrentNode("general"), [setCurrentNode]);
    useTitle(boardData.name + " | General");
    const renderContent = () => {
        return <React.Fragment>
            <ThemeSelectionModal isOpen={modal.open && modal.type === "theme"} onHide={() => setModal({...modal, open: false})} onUpdate={color => onThemeChange(color)}/>
            <UiCol xs={12} lg={6}>
                <UiFormLabel>Board Name</UiFormLabel>
                <UiClickableTip id={"boardName"} title={"Set Board Name"} description={"Name of your board should be at least 4 and maximum 25 characters long."}/>
                <UiCountableFormControl label={"Type board name"} id={"boardTextarea"} className={"bg-light"} minLength={4} maxLength={25} placeholder={"Short name of board."} defaultValue={boardData.name}/>
            </UiCol>
            <UiCol xs={12} lg={6} className={"mt-lg-0 mt-2"}>
                <UiFormLabel>Short Description</UiFormLabel>
                <UiClickableTip id={"boardShortDescription"} title={"Set Short Description"} description={"Very short board description used for thumbnail purposes. Keep it under 50 characters long."}/>
                <UiCountableFormControl label={"Type board short description"} id={"shortDescrTextarea"} className={"bg-light"} minLength={10} maxLength={50} placeholder={"Short description of board."}
                                        defaultValue={boardData.shortDescription}/>
            </UiCol>
            <UiCol xs={12} lg={6} className={"mt-2"}>
                <UiFormLabel>Full Description</UiFormLabel>
                <UiClickableTip id={"boardDescription"} title={"Set Description"} description={<React.Fragment>
                    Full description visible at your board, markdown supported. Keep it under 2500
                    characters long.
                    <br/>
                    <strong>Markdown Tips:</strong>
                    <br/><UiKeyboardInput><strong>**bold text**</strong></UiKeyboardInput> <UiKeyboardInput><i>*italic text*</i></UiKeyboardInput>
                </React.Fragment>}/>
                <UiFormControl as={TextareaAutosize} label={"Type board description"} className={"bg-light"} minLength={10} maxLength={2500} rows={6}
                               maxRows={13} required placeholder={"Full and descriptive description of board (supports emojis and markdown)."}
                               defaultValue={htmlDecode(boardData.fullDescription)} id={"fullDescrTextarea"}
                               onChange={e => {
                                   e.target.value = e.target.value.substring(0, 2500);
                                   formatRemainingCharacters("remainingFullDescr", "fullDescrTextarea", 2500);
                               }}/>
                <UiFormText className={"float-left"}>
                    Markdown Supported
                </UiFormText>
                <UiFormText className={"float-right"} id={"remainingFullDescr"}>
                    {2500 - boardData.fullDescription.length} Remaining
                </UiFormText>
            </UiCol>
            <UiCol xs={12} lg={6} className={"mt-2"}>
                <UiFormLabel>Theme Color</UiFormLabel>
                <UiClickableTip id={"themeColor"} title={"Set Theme Color"} description={"Configure theme color of your board. It will affect elements of your board. Colors might look differently across Light and Dark Themes."}/>
                <br/>
                <Suspense fallback={<UiLoadingSpinner/>}>
                    <ColorPickerContainer color={getTheme(false)} onChange={color => onThemeChange(color.hex)}/>
                    <ThemeSelector onClick={() => setModal({open: true, type: "theme"})}>
                        <div style={{
                            background: "transparent none repeat scroll 0% 0%", height: "100%", width: "100%", cursor: "pointer", position: "relative",
                            outline: "currentcolor none medium", borderRadius: "50%", boxShadow: getTheme() + " 0px 0px 0px 15px inset"
                        }}>
                            <FaEllipsisH className={"text-white"} style={{left: 0, right: 0, bottom: 0, top: 0, margin: "auto", position: "absolute"}}/>
                        </div>
                    </ThemeSelector>
                </Suspense>
            </UiCol>
            <UiCol xs={12} lg={8} className={"mt-2"}>
                <UiFormLabel>Board Banner</UiFormLabel>
                <UiClickableTip id={"banner"} title={"Set Board Banner"} description={"Suggested size: 1120x400. Maximum size 500 kb, PNG and JPG only."}/>
                <br/>
                <div aria-label={"Banner Upload"} onClick={() => document.getElementById("bannerInput").click()}>
                    <Banner image={boardData.banner} aria-label={"Board Banner View"} id={"boardBannerPreview"} className={"mb-2"}
                            style={{minHeight: 200, position: "relative"}}>
                        <h3 style={{color: "transparent"}}>{boardData.name}</h3>
                        <h5 style={{color: "transparent"}}>{boardData.shortDescription}</h5>
                        <UploadIconBox/>
                    </Banner>
                </div>
                <input hidden accept={"image/jpeg, image/png"} id={"bannerInput"} type={"file"} name={"banner"} aria-label={"Banner Upload"} onChange={onBannerChange}/>
            </UiCol>
            <UiCol xs={12} lg={4} className={"mt-2"}>
                <UiFormLabel>Board Logo</UiFormLabel>
                <UiClickableTip id={"logo"} title={"Set Board Logo"}
                                description={"Suggested size: 100x100. Maximum size 150 kb, PNG and JPG only."}/>
                <div aria-label={"Logo Upload"} style={{position: "relative", maxWidth: 200}} onClick={() => document.getElementById("logoInput").click()}>
                    <img alt={"Board Logo View"} src={boardData.logo} id={"boardLogo"} className={"mb-2"} width={200} height={200}/>
                    <UploadIconBox/>
                </div>
                <input hidden accept={"image/jpeg, image/png"} id={"logoInput"} type={"file"} name={"logo"} aria-label={"Logo Upload"} onChange={onLogoChange}/>
            </UiCol>
            <UiCol xs={12}>
                <UiLoadableButton label={"Save"} className={"mt-3 float-right"} onClick={onChangesSave}>
                    Save Settings
                </UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    const conditionalButton = (conditionEnabled, funcEnable, funcDisable) => {
        if (conditionEnabled) {
            return <UiLoadableButton label={"Disable"} color={tinycolor("#ff3547")} className={"mt-sm-0 mt-2"} onClick={funcDisable}>Disable</UiLoadableButton>
        }
        return <UiLoadableButton label={"Enable"} color={tinycolor("#00c851")} className={"mt-sm-0 mt-2"} onClick={funcEnable}>Enable</UiLoadableButton>
    };
    const renderDangerContent = () => {
        return <UiViewBoxDangerBackground className={"mb-3 px-1 py-3 rounded mt-2 rounded-bottom"}>
            <UiRow noGutters className={"m-0 p-0 px-4 my-2 mb-4"}>
                <UiCol sm={9} xs={12}>
                    <h4 className={"mb-1"}>Anonymous Voting</h4>
                    <span className={"text-black-60"} style={{fontSize: ".9em"}}>
                        Allow users to vote anonymously without the need to log-in.
                    </span>
                </UiCol>
                <UiCol sm={3} xs={6} className={"text-sm-right text-left my-auto"}>
                    {conditionalButton(anonymousVoting, () => {
                        setAnonymousVoting(true);
                        return onChangesSave(true);
                    }, () => {
                        setAnonymousVoting(false);
                        return onChangesSave(false);
                    })}
                </UiCol>
            </UiRow>
            {renderApiKeyContent()}
            <UiRow noGutters className={"m-0 p-0 px-4 my-2"}>
                <UiCol sm={9} xs={12}>
                    <h4 className={"mb-1 text-red"}>Delete Board</h4>
                    <span className={"text-black-60"} style={{fontSize: ".9em"}}>
                        Permanently delete your board and all ideas in it. <strong>Irreversible action.</strong>
                    </span>
                </UiCol>
                <UiCol sm={3} xs={6} className={"text-sm-right text-left my-auto"}>
                    <UiLoadableButton label={"Delete"} className={"mt-sm-0 mt-2"} color={tinycolor("#ff3547")} onClick={() => Promise.resolve(setModal({...modal, open: true, type: "delete"}))}>
                        Delete
                    </UiLoadableButton>
                </UiCol>
            </UiRow>
        </UiViewBoxDangerBackground>
    };
    const renderApiKeyContent = () => {
        if (boardData.apiKey == null || boardData.apiKey === "") {
            return <UiRow noGutters className="m-0 p-0 pb-2 px-4 my-2">
                <UiCol sm={9} xs={12}>
                    <h4 className="mb-1 text-red">API Key</h4>
                    <span className="text-black-60" style={{fontSize: ".9em"}}>
                        Generate access key to utilise Feedbacky API for anonymous ideas posting.<br/>
                    </span>
                </UiCol>
                <UiCol sm={3} xs={6} className="text-sm-right text-left my-auto">
                    <UiButton label={"Enable"} className={"mt-sm-0 mt-2"} onClick={() => setModal({open: true, type: "apiEnable"})} color={tinycolor("#00c851")}>Enable</UiButton>
                </UiCol>
            </UiRow>
        } else {
            return <UiRow noGutters className="m-0 p-0 pb-2 px-4 my-2">
                <UiCol sm={9} xs={12}>
                    <h4 className="mb-1 text-red">API Key</h4>
                    <span className="text-black-60" style={{fontSize: ".9em"}}>
                        Generate access key to utilise Feedbacky API for anonymous ideas posting.<br/>
                        Your API key <ApiKeyElement className={apiKeyBlurred ? "text-blurred" : "text-red"}>{boardData.apiKey}</ApiKeyElement>
                        <ApiKeyIcon className="ml-1" style={{cursor: "pointer"}} onClick={() => setApiKeyBlurred(!apiKeyBlurred)}/>.
                        Remember to keep it safe!<br/>
                        <span><strong className="text-red" style={{cursor: "pointer"}} onClick={() => setModal({open: true, type: "apiReset"})}>Click here</strong> to regenerate API key if it got compromised.</span>
                    </span>
                </UiCol>
                <UiCol sm={3} xs={6} className="text-sm-right text-left my-auto">
                    <UiButton label={"Disable"} className={"mt-sm-0 mt-2"} color={tinycolor("#ff3547")} onClick={() => setModal({open: true, type: "apiDisable"})}>Disable</UiButton>
                </UiCol>
            </UiRow>
        }
    };
    const onBoardDelete = () => {
        return axios.delete("/boards/" + boardData.discriminator).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            //user no longer owns this board, remove from local context
            user.data.permissions = user.data.permissions.filter(board => board.boardDiscriminator !== boardData.discriminator);
            history.push("/me");
            popupNotification("Board deleted", getTheme());
        });
    };
    const onApiKeyEnable = () => {
        return axios.patch("/boards/" + boardData.discriminator + "/apiKey").then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            updateState({...boardData, apiKey: res.data.apiKey});
            popupNotification("API key generated and enabled.", getTheme());
        });
    };
    const onApiKeyDisable = () => {
        return axios.delete("/boards/" + boardData.discriminator + "/apiKey").then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            updateState({...boardData, apiKey: ""});
            popupNotification("API key disabled.", getTheme());
        });
    };
    const onApiKeyRegenerate = () => {
        return axios.patch("/boards/" + boardData.discriminator + "/apiKey").then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            setApiKeyBlurred(true);
            updateState({...boardData, apiKey: res.data.apiKey});
            popupNotification("API key regenerated.", getTheme());
        });
    };
    const onChangesSave = (anonymousAllowed = boardData.anonymousAllowed) => {
        const banner = bannerInput;
        const logo = logoInput;
        const name = document.getElementById("boardTextarea").value;
        const shortDescription = document.getElementById("shortDescrTextarea").value;
        const fullDescription = document.getElementById("fullDescrTextarea").value;
        const themeColor = getTheme(false).toHexString();
        return axios.patch("/boards/" + boardData.discriminator, {
            name, shortDescription, fullDescription, themeColor, banner, logo, anonymousAllowed
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            popupNotification("Settings updated", getTheme());
            updateState({
                ...boardData,
                name, shortDescription, fullDescription, themeColor,
                banner: banner || boardData.banner, logo: logo || boardData.logo
            });
        });
    };
    const onLogoChange = (e) => {
        if (!validateImageWithWarning(e, "logoInput", 250)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            document.getElementById("boardLogo").setAttribute("src", data);
            setLogoInput(data);
        });
    };
    const onBannerChange = (e) => {
        if (!validateImageWithWarning(e, "bannerInput", 650)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            document.getElementById("boardBannerPreview").style["background-image"] = "url('" + data + "')";
            setBannerInput(data);
        });
    };
    return <UiCol xs={12} md={9}>
        <DangerousActionModal id={"apiReset"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "apiReset"} onAction={onApiKeyRegenerate}
                              actionDescription={<div>API key will be regenerated and you must update it anywhere you use it.</div>} actionButtonName={"Regenerate"}/>
        <DangerousActionModal id={"apiDisable"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "apiDisable"} onAction={onApiKeyDisable}
                              actionDescription={<div>You won't be able to use Public Feedbacky API anymore.</div>} actionButtonName={"Disable"}/>
        <DangerousActionModal id={"apiEnable"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "apiEnable"} onAction={onApiKeyEnable}
                              actionDescription={<div>Once you activate API key you can disable or regenerate it later. You'll get access to Public Feedbacky API with it.</div>} actionButtonName={"Enable"}/>
        <ConfirmationActionModal id={"boardDel"} actionButtonName={"Delete Now"} isOpen={modal.open && modal.type === "delete"} onAction={onBoardDelete} onHide={() => setModal({...modal, open: false})}
                                 actionDescription={<div>
                                     <strong>This is one-way road</strong> and your board and all the data <strong>will be permanently deleted.</strong>
                                     <div>Are you really sure?</div>
                                     <div>Type <kbd>{boardData.name}</kbd> to continue.</div>
                                 </div>} confirmText={boardData.name} confirmFailMessage={"Type valid board name."}/>
        <UiViewBox title={"General Settings"} description={"Configure your board base settings here."}>
            {renderContent()}
        </UiViewBox>
        {renderDangerContent()}
    </UiCol>
};

export default GeneralSubroute;