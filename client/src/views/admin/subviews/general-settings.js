import React, {Component, lazy, Suspense} from 'react';
import {Col, Form, Row} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {formatRemainingCharacters, getBase64FromFile, htmlDecode, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "components/util/utils";
import AppContext from "context/app-context";
import swalReact from "sweetalert2-react-content";
import Swal from "sweetalert2";
import AdminSidebar from "components/sidebar/admin-sidebar";
import TextareaAutosize from "react-autosize-textarea";
import LoadingSpinner from "components/util/loading-spinner";
import {retry} from "components/util/lazy-init";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import ViewBox from "components/viewbox/view-box";
import {FaUpload} from "react-icons/all";

const CirclePicker = lazy(() => retry(() => import ("react-color").then(module => ({default: module.CirclePicker}))));

class GeneralSettings extends Component {

    static contextType = AppContext;
    swalGenerator = swalReact(Swal);

    state = {
        bannerInput: null,
        logoInput: null,
    };

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="general" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col xs={12} md={9}>
                <ViewBox theme={this.context.getTheme()} title="General Settings"
                         description="Configure your board base settings here.">
                    {this.renderContent()}
                </ViewBox>
                {this.renderDangerContent()}
            </Col>
        </React.Fragment>
    }

    renderContent() {
        return <React.Fragment>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 text-black-60">Board Name</Form.Label>
                <ClickableTip id="boardName" title="Set Board Name"
                              description="Name of your board should be at least 4 and maximum 25 characters long."/>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="4" maxLength="25" rows="1"
                              required type="text"
                              placeholder="Short name of board." defaultValue={this.props.data.name}
                              id="boardTextarea" className="bg-light"
                              onKeyUp={() => formatRemainingCharacters("remainingBoardName", "boardTextarea", 25)}/>
                <Form.Text className="text-right text-black-60" id="remainingBoardName">
                    {25 - this.props.data.name.length} Remaining
                </Form.Text>
            </Col>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 mt-lg-0 mt-2 text-black-60">Short Description</Form.Label>
                <ClickableTip id="boardShortDescription" title="Set Short Description"
                              description="Very short board description used for thumbnail purposes. Keep it under 50 characters long."/>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="10" maxLength="50" rows="1"
                              required type="text" className="bg-light"
                              placeholder="Short description of board."
                              defaultValue={this.props.data.shortDescription} id="shortDescrTextarea"
                              onKeyUp={() => formatRemainingCharacters("remainingShortDescr", "shortDescrTextarea", 50)}/>
                <Form.Text className="text-right text-black-60" id="remainingShortDescr">
                    {50 - this.props.data.shortDescription.length} Remaining
                </Form.Text>
            </Col>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 text-black-60 mt-2">Full Description</Form.Label>
                <ClickableTip id="boardDescription" title="Set Description" description={<React.Fragment>
                    Full description visible at your Feedbacky board, markdown supported. Keep it under 2500
                    characters long.
                    <br/>
                    <strong>Markdown Tips:</strong>
                    <br/><strong>**bold text**</strong> <i>*italic text*</i>
                </React.Fragment>}/>
                <TextareaAutosize className="form-control bg-light" minLength="10" maxLength="2500" rows={6}
                                  maxRows={13} required as="textarea"
                                  placeholder="Full and descriptive description of board (supports emojis and markdown)."
                                  defaultValue={htmlDecode(this.props.data.fullDescription)}
                                  id="fullDescrTextarea"
                                  onKeyUp={() => formatRemainingCharacters("remainingFullDescr", "fullDescrTextarea", 2500)}/>
                <Form.Text className="d-inline float-left text-black-60 d-inline">
                    Markdown Supported
                </Form.Text>
                <Form.Text className="d-inline float-right text-black-60" id="remainingFullDescr">
                    {2500 - this.props.data.fullDescription.length} Remaining
                </Form.Text>
            </Col>
            <Col xs={12} lg={6}>
                <Form.Label className="mr-1 text-black-60 mt-2">Theme Color</Form.Label>
                <ClickableTip id="themeColor" title="Set Theme Color"
                              description="Configure theme color of your board. It will affect elements of your board."/>
                <br/>
                <Suspense fallback={<LoadingSpinner/>}>
                    <CirclePicker
                        colors={["#202428", "#2d3436", "#2c3e50", "#d35400", "#e74c3c", "#e67e22", "#8e44ad", "#2980b9", "#3498db", "#f39c12", "#f1c40f", "#27ae60", "#2ecc71", "#16a085", "#1abc9c", "#95a5a6"]}
                        className="text-center color-picker-admin"
                        circleSpacing={4} color={this.context.theme}
                        onChangeComplete={(color) => this.context.onThemeChange(color.hex)}/>
                </Suspense>
            </Col>
            <Col xs={12} lg={8}>
                <Form.Label className="mr-1 text-black-60 mt-2">Board Banner</Form.Label>
                <ClickableTip id="banner" title="Set Board Banner"
                              description="Suggested size: 1120x400. Maximum size 500 kb, PNG and JPG only."/>
                <br/>
                <div className="cursor-click" onClick={() => document.getElementById("bannerInput").click()}>
                    <div className="text-white row justify-content-center text-center" style={{position: "absolute", top: "40%", left: 0, right: 0}}>
                        <div className="p-3 rounded-circle" style={{backgroundColor: this.context.getTheme().setAlpha(.8), width: "90px", height: "90px"}}>
                            <FaUpload className="mb-1" style={{width: "1.8em", height: "1.8em"}}/>
                            <div className="text-tight">Update</div>
                        </div>
                    </div>
                    <div id="boardBannerPreview" className="jumbotron mb-2"
                         style={{backgroundImage: `url("` + this.props.data.banner + `")`, minHeight: 200}}>
                        <h3 className="h3-responsive" style={{color: "transparent"}}>{this.props.data.name}</h3>
                        <h5 className="h5-responsive"
                            style={{color: "transparent"}}>{this.props.data.shortDescription}</h5>
                    </div>
                </div>
                <input className="small text-black-75" hidden accept="image/jpeg, image/png" id="bannerInput"
                       type="file" name="banner" onChange={this.onBannerChange}/>
            </Col>
            <Col xs={12} lg={4}>
                <Form.Label className="mr-1 text-black-60 mt-2">Board Logo</Form.Label>
                <ClickableTip id="logo" title="Set Board Logo"
                              description="Suggested size: 100x100. Maximum size 150 kb, PNG and JPG only."/>
                <br/>
                <img alt="logo" src={this.props.data.logo} id="boardLogo" className="img-fluid mb-2"
                     width="50px"/>
                <br/>
                <input className="small text-black-75" accept="image/jpeg, image/png" id="logoInput" type="file"
                       name="logo" onChange={this.onLogoChange}/>
            </Col>
            <Col xs={12}>
                <Button className="m-0 mt-3 text-white float-right" variant=""
                        style={{backgroundColor: this.context.theme}} onClick={this.onChangesSave}>
                    Save Settings
                </Button>
            </Col>
        </React.Fragment>
    }

    renderDangerContent() {
        return <Col className="mb-3 view-box-bg px-1 py-3 rounded mt-2 danger-shadow rounded-bottom">
            <Row className="m-0 p-0 px-4 mb-3 mt-2">
                <Col xs={12} sm={9} className="p-0">
                    <h4 className="mb-1 h4-responsive">Private Board</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                            Private board can be seen only by invited users from <kbd>Invitations</kbd> section, service staff and moderators.
                    </span>
                </Col>
                <Col xs={6} sm={3} className="p-0 text-sm-right text-left my-auto">
                    {this.renderPrivateBoardButton()}
                </Col>
            </Row>
            <Row className="m-0 p-0 px-4 mb-2">
                <div className="col-sm-9 col-12 p-0">
                    <h4 className="mb-1 h4-responsive text-danger">Delete Board</h4>
                    <span className="text-black-50" style={{fontSize: ".9em"}}>
                                Permanently delete your board and all ideas in it. <strong>Irreversible action.</strong>
                           </span>
                </div>
                <div className="col-sm-3 col-6 p-0 text-sm-right text-left my-auto">
                    <Button variant="danger" className="m-0 mt-sm-0 mt-2" onClick={() => this.onBoardDelete()}>Delete</Button>
                </div>
            </Row>
        </Col>
    }

    renderPrivateBoardButton() {
        if (this.props.data.privatePage) {
            return <Button variant="danger" className="m-0 mt-sm-0 mt-2"
                           onClick={() => this.onBoardPrivacyChange(false)}>Disable</Button>
        }
        return <Button variant="success" className="m-0 mt-sm-0 mt-2"
                       onClick={() => this.onBoardPrivacyChange(true)}>Enable</Button>
    }

    onBoardDelete = () => {
        this.swalGenerator.fire({
            title: "Irreversible action!",
            html: "Hold on, <strong>this is one way road</strong>.<br/>Your board with all ideas will be <strong>permanently lost.</strong>" +
                "<br/><br/>Type board name (" + this.props.data.name + ") to confirm deletion and continue.",
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
                if (this.props.data.name === name) {
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
            axios.delete("/boards/" + this.props.data.discriminator).then(res => {
                if (res.status !== 200 && res.status !== 204) {
                    toastError();
                    return;
                }
                this.props.history.push("/me");
                toastSuccess("Board permanently deleted.", toastId);
            }).catch(err => toastError(err.response.data.errors[0]));
        });
    };

    onBoardPrivacyChange = (state) => {
        let html;
        if (state) {
            html = "Users will no longer be able to see this board unless you invite them.<br/>Board moderators and Feedbacky staff will still have access to this board.";
        } else {
            html = "Every user will now be able to see this board and all it's ideas.";
        }
        popupSwal("warning", "Dangerous action", html, "Change Privacy", "#d33",
            willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.patch("/boards/" + this.props.data.discriminator, {privatePage: state}).then(res => {
                    if (res.status !== 200) {
                        toastError();
                        return;
                    }
                    this.props.updateState({
                        ...this.props.data, privatePage: state
                    });
                    toastSuccess("Board visibility toggled.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };

    onChangesSave = () => {
        const banner = this.state.bannerInput;
        const logo = this.state.logoInput;
        const toastId = toastAwait("Saving changes...");
        const name = document.getElementById("boardTextarea").value;
        const shortDescription = document.getElementById("shortDescrTextarea").value;
        const fullDescription = document.getElementById("fullDescrTextarea").value;
        const themeColor = this.context.theme;
        axios.patch("/boards/" + this.props.data.discriminator, {
            name, shortDescription, fullDescription, themeColor, banner, logo,
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            toastSuccess("Settings successfully updated.", toastId);
            this.props.updateState({
                ...this.props.data,
                name, shortDescription, fullDescription, themeColor,
                banner: banner || this.props.data.banner, logo: logo || this.props.data.logo
            });
        }).catch(err => {
            if (err.response === undefined) {
                return;
            }
            err.response.data.errors.forEach(data => {
                if (data.includes("Field 'name' must be")) {
                    toastWarning("Board name must be longer than 4 characters.");
                } else if (data.includes("Field 'shortDescription' must be")) {
                    toastWarning("Short description must be longer than 10 characters.");
                } else if (data.includes("Field 'fullDescription' must be")) {
                    toastWarning("Full description must be longer than 10 characters.");
                } else if (data.includes("Field 'themeColor' must")) {
                    toastWarning("Theme color must be a valid Hex value.");
                } else {
                    toastWarning(data);
                }
            });
        })
    };

    onLogoChange = (e) => {
        if (!validateImageWithWarning(e, "logoInput", 250)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            document.getElementById("boardLogo").setAttribute("src", data);
            this.setState({logoInput: data});
        });
    };

    onBannerChange = (e) => {
        if (!validateImageWithWarning(e, "bannerInput", 650)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            document.getElementById("boardBannerPreview").style["background-image"] = "url('" + data + "')";
            this.setState({bannerInput: data});
        });
    };

}

export default GeneralSettings;