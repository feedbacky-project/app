import axios from "axios";
import ThemeSelectionModal from "components/board/admin/ThemeSelectionModal";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import React, {lazy, Suspense, useContext, useEffect, useState} from 'react';
import TextareaAutosize from "react-autosize-textarea";
import {Form} from "react-bootstrap";
import {FaEllipsisH, FaUpload} from "react-icons/all";
import {useHistory} from "react-router-dom";
import Swal from "sweetalert2";
import swalReact from "sweetalert2-react-content";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiCountableFormControl, UiLoadingSpinner} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiCol, UiRow} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {formatRemainingCharacters, getBase64FromFile, htmlDecode, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "utils/basic-utils";
import {retry} from "utils/lazy-init";

const CirclePicker = lazy(() => retry(() => import ("react-color").then(module => ({default: module.CirclePicker}))));

const GeneralSubroute = ({updateState}) => {
    const history = useHistory();
    const {onThemeChange, getTheme, user} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const swalGenerator = swalReact(Swal);
    const [bannerInput, setBannerInput] = useState(null);
    const [logoInput, setLogoInput] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    useEffect(() => setCurrentNode("general"), [setCurrentNode]);
    const renderContent = () => {
        return <React.Fragment>
            <ThemeSelectionModal isOpen={modalOpen} onHide={() => setModalOpen(false)} onUpdate={color => onThemeChange(color)}/>
            <UiCol xs={12} lg={6}>
                <Form.Label className={"mr-1 text-black-60"}>Board Name</Form.Label>
                <UiClickableTip id={"boardName"} title={"Set Board Name"} description={"Name of your board should be at least 4 and maximum 25 characters long."}/>
                <UiCountableFormControl id={"boardTextarea"} className={"bg-light"} minLength={4} maxLength={25} placeholder={"Short name of board."} defaultValue={boardData.name}/>
            </UiCol>
            <UiCol xs={12} lg={6}>
                <Form.Label className={"mr-1 mt-lg-0 mt-2 text-black-60"}>Short Description</Form.Label>
                <UiClickableTip id={"boardShortDescription"} title={"Set Short Description"} description={"Very short board description used for thumbnail purposes. Keep it under 50 characters long."}/>
                <UiCountableFormControl id={"shortDescrTextarea"} className={"bg-light"} minLength={10} maxLength={50} placeholder={"Short description of board."}
                                        defaultValue={boardData.shortDescription}/>
            </UiCol>
            <UiCol xs={12} lg={6} className={"mt-2"}>
                <Form.Label className={"mr-1 text-black-60"}>Full Description</Form.Label>
                <UiClickableTip id={"boardDescription"} title={"Set Description"} description={<React.Fragment>
                    Full description visible at your board, markdown supported. Keep it under 2500
                    characters long.
                    <br/>
                    <strong>Markdown Tips:</strong>
                    <br/><strong>**bold text**</strong> <i>*italic text*</i>
                </React.Fragment>}/>
                <TextareaAutosize className={"form-control bg-light"} minLength={10} maxLength={2500} rows={6}
                                  maxRows={13} required as={"textarea"}
                                  placeholder={"Full and descriptive description of board (supports emojis and markdown)."}
                                  defaultValue={htmlDecode(boardData.fullDescription)}
                                  id={"fullDescrTextarea"}
                                  onChange={e => {
                                      e.target.value = e.target.value.substring(0, 2500);
                                      formatRemainingCharacters("remainingFullDescr", "fullDescrTextarea", 2500);
                                  }}/>
                <Form.Text className={"d-inline float-left text-black-60 d-inline"}>
                    Markdown Supported
                </Form.Text>
                <Form.Text className={"d-inline float-right text-black-60"} id={"remainingFullDescr"}>
                    {2500 - boardData.fullDescription.length} Remaining
                </Form.Text>
            </UiCol>
            <UiCol xs={12} lg={6} className={"mt-2"}>
                <Form.Label className={"mr-1 text-black-60"}>Theme Color</Form.Label>
                <UiClickableTip id={"themeColor"} title={"Set Theme Color"} description={"Configure theme color of your board. It will affect elements of your board. Colors might look differently across Light and Dark Themes."}/>
                <br/>
                <Suspense fallback={<UiLoadingSpinner/>}>
                    <CirclePicker
                        colors={["#273c75", "#2c3e50", "#8e44ad", "#B33771",
                            "#d35400", "#e74c3c", "#706fd3", "#218c74",
                            "#2980b9", "#16a085", "#e67e22", "#27ae60",
                            "#44bd32", "#1B9CFC", "#3498db", "#EE5A24"]}
                        className={"text-center color-picker-admin"}
                        circleSpacing={4} color={getTheme(false)}
                        onChangeComplete={color => onThemeChange(color.hex)}>
                    </CirclePicker>
                    <div className={"hoverable-option"} style={{width: 28, height: 28, marginRight: 4, marginTop: 4}} onClick={() => setModalOpen(true)}>
                        <span>
                        <div style={{
                            background: "transparent none repeat scroll 0% 0%", height: "100%", width: "100%", cursor: "pointer", position: "relative",
                            outline: "currentcolor none medium", borderRadius: "50%", boxShadow: getTheme() + " 0px 0px 0px 15px inset"
                        }}>
                            <FaEllipsisH className={"text-white"} style={{left: 0, right: 0, bottom: 0, top: 0, margin: "auto", position: "absolute"}}/>
                        </div>
                        </span>
                    </div>
                </Suspense>
            </UiCol>
            <UiCol xs={12} lg={8} className={"mt-2"}>
                <Form.Label className={"mr-1 text-black-60"}>Board Banner</Form.Label>
                <UiClickableTip id={"banner"} title={"Set Board Banner"} description={"Suggested size: 1120x400. Maximum size 500 kb, PNG and JPG only."}/>
                <br/>
                <div onClick={() => document.getElementById("bannerInput").click()}>
                    <div id={"boardBannerPreview"} className={"jumbotron mb-2"}
                         style={{backgroundImage: `url("` + boardData.banner + `")`, minHeight: 200, position: "relative"}}>
                        <h3 style={{color: "transparent"}}>{boardData.name}</h3>
                        <h5 style={{color: "transparent"}}>{boardData.shortDescription}</h5>
                        <div className={"p-3 rounded-circle hoverable-option"} style={{
                            backgroundColor: getTheme().setAlpha(.8), cursor: "pointer",
                            width: "90px", height: "90px", position: "absolute", inset: 0, margin: "auto"
                        }}>
                            <FaUpload className={"mb-1"} style={{width: "1.8em", height: "1.8em"}}/>
                            <div>Update</div>
                        </div>
                    </div>
                </div>
                <input hidden accept={"image/jpeg, image/png"} id={"bannerInput"} type={"file"} name={"banner"} onChange={onBannerChange}/>
            </UiCol>
            <UiCol xs={12} lg={4} className={"mt-2"}>
                <Form.Label className={"mr-1 text-black-60"}>Board Logo</Form.Label>
                <UiClickableTip id={"logo"} title={"Set Board Logo"}
                                description={"Suggested size: 100x100. Maximum size 150 kb, PNG and JPG only."}/>
                <div style={{position: "relative", maxWidth: 200}} onClick={() => document.getElementById("logoInput").click()}>
                    <img alt={"logo"} src={boardData.logo} id={"boardLogo"} className={"mb-2"} width={200} height={200}/>
                    <div className={"p-3 rounded-circle hoverable-option text-center text-white"} style={{
                        backgroundColor: getTheme().setAlpha(.8), cursor: "pointer",
                        width: "90px", height: "90px", position: "absolute", inset: 0, margin: "auto"
                    }}>
                        <FaUpload className={"mb-1"} style={{width: "1.8em", height: "1.8em"}}/>
                        <div>Update</div>
                    </div>
                </div>
                <input hidden accept={"image/jpeg, image/png"} id={"logoInput"} type={"file"} name={"logo"} onChange={onLogoChange}/>
            </UiCol>
            <UiCol xs={12}>
                <UiLoadableButton className={"m-0 mt-3 float-right"} onClick={onChangesSave}>
                    Save Settings
                </UiLoadableButton>
            </UiCol>
        </React.Fragment>
    };
    const renderDangerContent = () => {
        return <div className={"mb-3 view-box-bg px-1 py-3 rounded mt-2 danger-shadow rounded-bottom"}>
            <UiRow noGutters className={"m-0 p-0 px-4 my-2"}>
                <UiCol sm={9} xs={12}>
                    <h4 className={"mb-1 text-danger"}>Delete Board</h4>
                    <span className={"text-black-60"} style={{fontSize: ".9em"}}>
                        Permanently delete your board and all ideas in it. <strong>Irreversible action.</strong>
                    </span>
                </UiCol>
                <UiCol sm={3} xs={6} className={"text-sm-right text-left my-auto"}>
                    <UiLoadableButton color={tinycolor("#ff3547")} onClick={onBoardDelete}>
                        Delete
                    </UiLoadableButton>
                </UiCol>
            </UiRow>
        </div>
    };
    const onBoardDelete = () => {
        return swalGenerator.fire({
            title: "Irreversible action!",
            html: "Hold on, <strong>this is one way road</strong>.<br/>Your board with all ideas will be <strong>permanently lost.</strong>" +
                "<br/><br/>Type board name (" + boardData.name + ") to confirm deletion and continue.",
            icon: "error",
            showCancelButton: true,
            animation: false,
            reverseButtons: true,
            focusCancel: true,
            cancelButtonColor: "#00c851",
            confirmButtonColor: "#d33",
            confirmButtonText: "Delete Now",
            input: "text",
            preConfirm: (name) => {
                if (boardData.name === name) {
                    return true;
                }
                Swal.showValidationMessage("Type valid board name.");
                return false;
            }
        }).then(willClose => {
            if (!willClose.value) {
                return;
            }
            let toastId = toastAwait("Deleting board, hold on...");
            axios.delete("/boards/" + boardData.discriminator).then(res => {
                if (res.status !== 200 && res.status !== 204) {
                    toastError();
                    return;
                }
                //user no longer owns this board, remove from local context
                user.data.permissions = user.data.permissions.filter(board => board.boardDiscriminator !== boardData.discriminator);
                history.push("/me");
                toastSuccess("Board permanently deleted.", toastId);
            }).catch(err => toastError(err.response.data.errors[0]));
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
        }).catch(err => {
            if (err.response === undefined) {
                return;
            }
            err.response.data.errors.forEach(data => toastWarning(data));
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
        <UiViewBox title={"General Settings"} description={"Configure your board base settings here."}>
            {renderContent()}
        </UiViewBox>
        {renderDangerContent()}
    </UiCol>
};

export default GeneralSubroute;