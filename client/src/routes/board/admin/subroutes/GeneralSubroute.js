import styled from "@emotion/styled";
import axios from "axios";
import ThemeSelectionModal from "components/board/admin/ThemeSelectionModal";
import {Banner} from "components/board/BoardBanner";
import ColorPickerContainer from "components/commons/ColorPickerContainer";
import ConfirmationActionModal from "components/commons/ConfirmationActionModal";
import UploadIconBox from "components/commons/UploadIconBox";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import React, {Suspense, useContext, useEffect, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {FaEllipsisH} from "react-icons/all";
import {useHistory} from "react-router-dom";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiKeyboardInput, UiLoadingSpinner} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiCountableFormControl, UiFormControl, UiFormLabel, UiFormText} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {UiViewBoxBackground} from "ui/viewbox/UiViewBox";
import {formatRemainingCharacters, getBase64FromFile, htmlDecode, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "utils/basic-utils";

const ThemeSelector = styled.div`
  width: 28px;
  height: 28px;
  margin-right: 4px;
  margin-top: 4px;
  transition: var(--hover-transition);
  
  &:hover {
    transform: scale(1.2);
  }
`;

const GeneralSubroute = ({updateState}) => {
    const history = useHistory();
    const {onThemeChange, getTheme, user} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [modal, setModal] = useState({open: false, type: ""});
    const [bannerInput, setBannerInput] = useState(null);
    const [logoInput, setLogoInput] = useState(null);
    useEffect(() => setCurrentNode("general"), [setCurrentNode]);
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
                <div onClick={() => document.getElementById("bannerInput").click()}>
                    <Banner image={boardData.banner} id={"boardBannerPreview"} className={"mb-2"}
                            style={{minHeight: 200, position: "relative"}}>
                        <h3 style={{color: "transparent"}}>{boardData.name}</h3>
                        <h5 style={{color: "transparent"}}>{boardData.shortDescription}</h5>
                        <UploadIconBox/>
                    </Banner>
                </div>
                <input hidden accept={"image/jpeg, image/png"} id={"bannerInput"} type={"file"} name={"banner"} onChange={onBannerChange}/>
            </UiCol>
            <UiCol xs={12} lg={4} className={"mt-2"}>
                <UiFormLabel>Board Logo</UiFormLabel>
                <UiClickableTip id={"logo"} title={"Set Board Logo"}
                                description={"Suggested size: 100x100. Maximum size 150 kb, PNG and JPG only."}/>
                <div style={{position: "relative", maxWidth: 200}} onClick={() => document.getElementById("logoInput").click()}>
                    <img alt={"logo"} src={boardData.logo} id={"boardLogo"} className={"mb-2"} width={200} height={200}/>
                    <UploadIconBox/>
                </div>
                <input hidden accept={"image/jpeg, image/png"} id={"logoInput"} type={"file"} name={"logo"} onChange={onLogoChange}/>
            </UiCol>
            <UiCol xs={12}>
                <UiLoadableButton label={"Save"} className={"mt-3 float-right"} onClick={onChangesSave}>
                    Save Settings
                </UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    const renderDangerContent = () => {
        return <UiViewBoxBackground className={"mb-3 px-1 py-3 rounded mt-2 danger-shadow rounded-bottom"}>
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
        </UiViewBoxBackground>
    };
    const onBoardDelete = () => {
        const toastId = toastAwait("Deleting board, hold on...");
        return axios.delete("/boards/" + boardData.discriminator).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            //user no longer owns this board, remove from local context
            user.data.permissions = user.data.permissions.filter(board => board.boardDiscriminator !== boardData.discriminator);
            history.push("/me");
            toastSuccess("Board permanently deleted.", toastId);
        });
    };
    const onChangesSave = () => {
        const banner = bannerInput;
        const logo = logoInput;
        const toastId = toastAwait("Saving changes...");
        const name = document.getElementById("boardTextarea").value;
        const shortDescription = document.getElementById("shortDescrTextarea").value;
        const fullDescription = document.getElementById("fullDescrTextarea").value;
        const themeColor = getTheme(false).toHexString();
        return axios.patch("/boards/" + boardData.discriminator, {
            name, shortDescription, fullDescription, themeColor, banner, logo,
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            toastSuccess("Settings successfully updated.", toastId);
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