import React, {lazy, Suspense, useContext, useState} from 'react';
import {Col, Form, Row} from "react-bootstrap";
import axios from "axios";
import {formatRemainingCharacters, getBase64FromFile, htmlDecode, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "components/util/utils";
import AppContext from "context/app-context";
import swalReact from "sweetalert2-react-content";
import Swal from "sweetalert2";
import AdminSidebar from "components/sidebar/admin-sidebar";
import {retry} from "components/util/lazy-init";
import ViewBox from "components/viewbox/view-box";
import BoardContext from "context/board-context";
import ClickableTip from "components/util/clickable-tip";
import TextareaAutosize from "react-autosize-textarea";
import LoadingSpinner from "components/util/loading-spinner";
import {FaEllipsisH, FaUpload} from "react-icons/all";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";
import ColorSelectionModal from "components/modal/color-selection-modal";
import ExecutableButton from "components/app/executable-button";

const CirclePicker = lazy(() => retry(() => import ("react-color").then(module => ({default: module.CirclePicker}))));

const GeneralSettings = ({reRouteTo, updateState}) => {
    const history = useHistory();
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const swalGenerator = swalReact(Swal);
    const [bannerInput, setBannerInput] = useState(null);
    const [logoInput, setLogoInput] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const renderContent = () => {
        return <React.Fragment>
            <ColorSelectionModal open={modalOpen} onClose={() => setModalOpen(false)} onUpdate={(color) => context.onThemeChange(color)}/>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 text-black-60">Board Name</Form.Label>
                <ClickableTip id="boardName" title="Set Board Name" description="Name of your board should be at least 4 and maximum 25 characters long."/>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="4" maxLength="25" rows="1"
                              required type="text"
                              placeholder="Short name of board." defaultValue={boardData.name}
                              id="boardTextarea" className="bg-light"
                              onKeyUp={() => formatRemainingCharacters("remainingBoardName", "boardTextarea", 25)}/>
                <Form.Text className="text-right text-black-60" id="remainingBoardName">
                    {25 - boardData.name.length} Remaining
                </Form.Text>
            </Col>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 mt-lg-0 mt-2 text-black-60">Short Description</Form.Label>
                <ClickableTip id="boardShortDescription" title="Set Short Description" description="Very short board description used for thumbnail purposes. Keep it under 50 characters long."/>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="10" maxLength="50" rows="1"
                              required type="text" className="bg-light"
                              placeholder="Short description of board."
                              defaultValue={boardData.shortDescription} id="shortDescrTextarea"
                              onKeyUp={() => formatRemainingCharacters("remainingShortDescr", "shortDescrTextarea", 50)}/>
                <Form.Text className="text-right text-black-60" id="remainingShortDescr">
                    {50 - boardData.shortDescription.length} Remaining
                </Form.Text>
            </Col>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 text-black-60 mt-2">Full Description</Form.Label>
                <ClickableTip id="boardDescription" title="Set Description" description={<React.Fragment>
                    Full description visible at your board, markdown supported. Keep it under 2500
                    characters long.
                    <br/>
                    <strong>Markdown Tips:</strong>
                    <br/><strong>**bold text**</strong> <i>*italic text*</i>
                </React.Fragment>}/>
                <TextareaAutosize className="form-control bg-light" minLength="10" maxLength="2500" rows={6}
                                  maxRows={13} required as="textarea"
                                  placeholder="Full and descriptive description of board (supports emojis and markdown)."
                                  defaultValue={htmlDecode(boardData.fullDescription)}
                                  id="fullDescrTextarea"
                                  onKeyUp={() => formatRemainingCharacters("remainingFullDescr", "fullDescrTextarea", 2500)}/>
                <Form.Text className="d-inline float-left text-black-60 d-inline">
                    Markdown Supported
                </Form.Text>
                <Form.Text className="d-inline float-right text-black-60" id="remainingFullDescr">
                    {2500 - boardData.fullDescription.length} Remaining
                </Form.Text>
            </Col>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 text-black-60 mt-2">Theme Color</Form.Label>
                <ClickableTip id="themeColor" title="Set Theme Color" description="Configure theme color of your board. It will affect elements of your board. Colors might look differently across Light and Dark Themes."/>
                <br/>
                <Suspense fallback={<LoadingSpinner/>}>
                    <CirclePicker
                        colors={["#2d3436", "#2c3e50", "#d35400", "#e74c3c", "#eb3b5a", "#e67e22", "#f39c12", "#fd9644", "#8e44ad", "#2980b9", "#3498db", "#27ae60", "#2ecc71", "#16a085", "#1abc9c", "#95a5a6"]}
                        className="text-center color-picker-admin"
                        circleSpacing={4} color={context.theme}
                        onChangeComplete={(color) => context.onThemeChange(color.hex)}>
                    </CirclePicker>
                    <div className="hoverable-option" style={{width: 28, height: 28, marginRight: 4, marginTop: 4}} onClick={() => setModalOpen(true)}>
                        <span>
                        <div style={{
                            background: "transparent none repeat scroll 0% 0%", height: "100%", width: "100%", cursor: "pointer", position: "relative",
                            outline: "currentcolor none medium", borderRadius: "50%", boxShadow: context.getTheme() + " 0px 0px 0px 15px inset"
                        }}>
                            <FaEllipsisH className="text-white" style={{left: 0, right: 0, bottom: 0, top: 0, margin: "auto", position: "absolute"}}/>
                        </div>
                        </span>
                    </div>
                </Suspense>
            </Col>
            <Col xs={12} lg={8}>
                <Form.Label className="mr-1 text-black-60 mt-2">Board Banner</Form.Label>
                <ClickableTip id="banner" title="Set Board Banner" description="Suggested size: 1120x400. Maximum size 500 kb, PNG and JPG only."/>
                <br/>
                <div onClick={() => document.getElementById("bannerInput").click()}>
                    <div id="boardBannerPreview" className="jumbotron mb-2"
                         style={{backgroundImage: `url("` + boardData.banner + `")`, minHeight: 200, position: "relative"}}>
                        <h3 style={{color: "transparent"}}>{boardData.name}</h3>
                        <h5 style={{color: "transparent"}}>{boardData.shortDescription}</h5>
                        <div className="p-3 rounded-circle hoverable-option" style={{
                            backgroundColor: context.getTheme().setAlpha(.8), cursor: "pointer",
                            width: "90px", height: "90px", position: "absolute", inset: 0, margin: "auto"
                        }}>
                            <FaUpload className="mb-1" style={{width: "1.8em", height: "1.8em"}}/>
                            <div className="text-tight">Update</div>
                        </div>
                    </div>
                </div>
                <input hidden accept="image/jpeg, image/png" id="bannerInput" type="file" name="banner" onChange={onBannerChange}/>
            </Col>
            <Col xs={12} lg={4}>
                <Form.Label className="mr-1 text-black-60 mt-2">Board Logo</Form.Label>
                <ClickableTip id="logo" title="Set Board Logo"
                              description="Suggested size: 100x100. Maximum size 150 kb, PNG and JPG only."/>
                <div style={{position: "relative", maxWidth: 200}} onClick={() => document.getElementById("logoInput").click()}>
                    <img alt="logo" src={boardData.logo} id="boardLogo" className="img-fluid mb-2" style={{height: 200}}/>
                    <div className="p-3 rounded-circle hoverable-option text-center text-white" style={{
                        backgroundColor: context.getTheme().setAlpha(.8), cursor: "pointer",
                        width: "90px", height: "90px", position: "absolute", inset: 0, margin: "auto"
                    }}>
                        <FaUpload className="mb-1" style={{width: "1.8em", height: "1.8em"}}/>
                        <div className="text-tight">Update</div>
                    </div>
                </div>
                <input hidden accept="image/jpeg, image/png" id="logoInput" type="file" name="logo" onChange={onLogoChange}/>
            </Col>
            <Col xs={12}>
                <ExecutableButton className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}} onClick={onChangesSave}>
                    Save Settings
                </ExecutableButton>
            </Col>
        </React.Fragment>
    };
    const renderDangerContent = () => {
        return <div className="mb-3 view-box-bg px-1 py-3 rounded mt-2 danger-shadow rounded-bottom">
            <Row noGutters className="m-0 p-0 px-4 my-2">
                <Col sm={9} xs={12}>
                    <h4 className="mb-1 text-danger">Delete Board</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                        Permanently delete your board and all ideas in it. <strong>Irreversible action.</strong>
                    </span>
                </Col>
                <Col sm={3} xs={6} className="text-sm-right text-left my-auto">
                    <ExecutableButton onClick={onBoardDelete} variant="danger">
                        Delete
                    </ExecutableButton>
                </Col>
            </Row>
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
                context.user.data.permissions = context.user.data.permissions.filter(board => board.boardDiscriminator !== boardData.discriminator);
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
        const themeColor = context.theme;
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
    return <React.Fragment>
        <AdminSidebar currentNode="general" reRouteTo={reRouteTo} data={boardData}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="General Settings" description="Configure your board base settings here.">
                {renderContent()}
            </ViewBox>
            {renderDangerContent()}
        </Col>
    </React.Fragment>
};

export default GeneralSettings;