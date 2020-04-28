import React, {Component, lazy, Suspense} from 'react';
import {Badge, Col, Form, OverlayTrigger, Popover, Row} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/fa";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {formatRemainingCharacters, getBase64FromFile, getSimpleRequestConfig, htmlDecode, toastAwait, toastError, toastSuccess, toastWarning, validateImageWithWarning} from "../../../components/util/utils";
import AppContext from "../../../context/app-context";
import swalReact from "sweetalert2-react-content";
import Swal from "sweetalert2";
import AdminSidebar from "../../../components/sidebar/admin-sidebar";
import TextareaAutosize from "react-autosize-textarea";
import LoadingSpinner from "../../../components/util/loading-spinner";
import {retry} from "../../../components/util/lazy-init";
import {popupSwal} from "../../../components/util/sweetalert-utils";

const CirclePicker = lazy(() => retry(() => import ("react-color").then(module => ({default: module.CirclePicker}))));

class GeneralSettings extends Component {

    static contextType = AppContext;
    swalGenerator = swalReact(Swal);

    state = {
        bannerInput: null,
        logoInput: null,
        privatePage: this.props.data.privatePage,
    };

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="general" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <Col xs={12} md={9} className="mt-4">
                <h2 className="h2-responsive mb-3">General Settings</h2>
                {this.renderContent()}
            </Col>
        </React.Fragment>
    }

    renderContent() {
        return <Col className="mb-3">
            <Row className="py-4 px-sm-2 px-0 rounded-top box-overlay">
                <Col xs={12} lg={6}>
                    <Form.Label className="mr-1 text-black-60">Board Name</Form.Label>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="boardNamePopover">
                                <Popover.Title as="h3">Set Board Name</Popover.Title>
                                <Popover.Content>
                                    Name of your board should be at least 4 and maximum 25 characters long
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <Form.Control style={{maxHeight: 38, resize: "none"}} minLength="4" maxLength="25" rows="1" required type="text"
                                  placeholder="Short name of board." defaultValue={this.props.data.name} id="boardTextarea"
                                  onKeyUp={() => formatRemainingCharacters("remainingBoardName", "boardTextarea", 25)}/>
                    <Form.Text className="text-right text-black-60" id="remainingBoardName">
                        {25 - this.props.data.name.length} Remaining
                    </Form.Text>
                </Col>
                <Col xs={12} lg={6}>
                    <Form.Label className="mr-1 mt-lg-0 mt-2 text-black-60">Short Description</Form.Label>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="boardDescPopover">
                                <Popover.Title as="h3">Set Short Description</Popover.Title>
                                <Popover.Content>
                                    Very short board description used for thumbnail purposes. Keep it under 50 characters long.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <Form.Control style={{maxHeight: 38, resize: "none"}} minLength="10" maxLength="50" rows="1" required type="text"
                                  placeholder="Short description of board." defaultValue={this.props.data.shortDescription} id="shortDescrTextarea"
                                  onKeyUp={() => formatRemainingCharacters("remainingShortDescr", "shortDescrTextarea", 50)}/>
                    <Form.Text className="text-right text-black-60" id="remainingShortDescr">
                        {50 - this.props.data.shortDescription.length} Remaining
                    </Form.Text>
                </Col>
                <Col xs={12} lg={6}>
                    <Form.Label className="mr-1 text-black-60 mt-2">Full Description</Form.Label>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="fullBoardDescPopover">
                                <Popover.Title as="h3">Set Description</Popover.Title>
                                <Popover.Content>
                                    Full description visible at your Feedbacky board, markdown supported. Keep it under 2500 characters long.
                                    <br/>
                                    <strong>Markdown Tips:</strong>
                                    <br/><strong>**bold text**</strong> <i>*italic text*</i>
                                    <br/><br/>
                                    Use two line breaks (click Enter twice) to make a separate blank line.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <TextareaAutosize className="form-control bg-lighter" minLength="10" maxLength="2500" rows={6} maxRows={13} required as="textarea"
                                      placeholder="Full and descriptive description of board (supports emojis and markdown)." defaultValue={htmlDecode(this.props.data.fullDescription)} id="fullDescrTextarea"
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
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="themePopover">
                                <Popover.Title as="h3">Set Theme Color</Popover.Title>
                                <Popover.Content>
                                    Configure theme color of your board. It will affect elements of your board.
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <br/>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <CirclePicker colors={["#202428", "#2d3436", "#2c3e50", "#d35400", "#e74c3c", "#e67e22", "#8e44ad", "#2980b9", "#3498db", "#f39c12", "#f1c40f", "#27ae60", "#2ecc71", "#16a085", "#1abc9c", "#95a5a6"]} className="text-center color-picker-admin"
                                      circleSpacing={4} color={this.context.theme} onChangeComplete={(color) => this.context.onThemeChange(color.hex)}/>
                    </Suspense>
                </Col>
                <Col xs={12} lg={8}>
                    <Form.Label className="mr-1 text-black-60 mt-2">Board Banner</Form.Label>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="bannerPopover">
                                <Popover.Title as="h3">Set Board Banner</Popover.Title>
                                <Popover.Content>
                                    Upload your board banner.
                                    <br/>
                                    <strong>
                                        Maximum size 500 kb, png and jpg only.
                                        <br/>
                                        Suggested size: 1120x400
                                    </strong>
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <br/>
                    {/* simulate real board jumbotron to show properly sized image */}
                    <div id="boardBanner" className="jumbotron mb-2" style={{backgroundImage: `url("` + this.props.data.banner + `")`}}>
                        <h3 className="h3-responsive" style={{color: "transparent"}}>{this.props.data.name}</h3>
                        <h5 className="h5-responsive" style={{color: "transparent"}}>{this.props.data.shortDescription}</h5>
                    </div>
                    <input className="small text-black-75" accept="image/jpeg, image/png" id="bannerInput" type="file" name="banner" onChange={this.onBannerChange}/>
                </Col>
                <Col xs={12} lg={4}>
                    <Form.Label className="mr-1 text-black-60 mt-2">Board Logo</Form.Label>
                    <OverlayTrigger
                        trigger="click"
                        placement="top"
                        rootClose={true}
                        rootCloseEvent="click"
                        overlay={
                            <Popover id="logoPopover">
                                <Popover.Title as="h3">Set Board Logo</Popover.Title>
                                <Popover.Content>
                                    Upload your board logo.
                                    <br/>
                                    <strong>
                                        Maximum size 150 kb, png and jpg only.
                                        <br/>
                                        Suggested size: 100x100
                                    </strong>
                                </Popover.Content>
                            </Popover>
                        }>
                        <FaQuestionCircle className="fa-xs text-black-50"/>
                    </OverlayTrigger>
                    <br/>
                    <img alt="logo" src={this.props.data.logo} id="boardLogo" className="img-fluid mb-2" width="50px"/>
                    <br/>
                    <input className="small text-black-75" accept="image/jpeg, image/png" id="logoInput" type="file" name="logo" onChange={this.onLogoChange}/>
                </Col>
                <Col xs={12} className="p-0">
                    <Button className="btn-smaller m-0 mt-3 ml-3 text-white" variant="" style={{backgroundColor: this.context.theme}} onClick={this.onChangesSave}>
                        Save Settings
                    </Button>
                </Col>
            </Row>
            <Form className="border-top-0 border-bottom-0 row py-3 box-overlay">
                <Form.Group className="row col-12 m-0 p-0 px-4">
                    <div className="col-sm-9 col-12 p-0">
                        <h4 className="mb-1 h4-responsive">
                            Private Board
                            <Badge variant="warning" className="ml-1" style={{transform: "translateY(-4px)"}}>Beta</Badge>
                        </h4>
                        <span className="text-black-50" style={{fontSize: ".9em"}}>
                            Private board can be seen only by invited users from <kbd>Invitations</kbd> section, Feedbacky staff and moderators.
                           </span>
                    </div>
                    <div className="col-sm-3 col-6 p-0 text-sm-right text-left my-auto">
                        {this.renderPrivateBoardButton()}
                    </div>
                </Form.Group>
            </Form>
            <Form className="rounded-bottom row py-3 box-overlay-danger">
                <Form.Group className="row col-12 m-0 p-0 px-4">
                    <div className="col-sm-9 col-12 p-0">
                        <h4 className="mb-1 h4-responsive text-danger">Delete Board</h4>
                        <span className="text-black-50" style={{fontSize: ".9em"}}>
                                Permanently delete your board and all ideas in it. <strong>Irreversible action.</strong>
                           </span>
                    </div>
                    <div className="col-sm-3 col-6 p-0 text-sm-right text-left my-auto">
                        <Button variant="danger" className="m-0 mt-sm-0 mt-2" onClick={() => this.onBoardDelete()}>Delete</Button>
                    </div>
                </Form.Group>
            </Form>
        </Col>
    }

    renderPrivateBoardButton() {
        if (this.state.privatePage) {
            return <Button variant="danger" className="m-0 mt-sm-0 mt-2" onClick={() => this.onBoardPrivacyChange(false)}>Disable</Button>
        }
        return <Button variant="success" className="m-0 mt-sm-0 mt-2" onClick={() => this.onBoardPrivacyChange(true)}>Enable</Button>
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
            axios.delete(this.context.apiRoute + "/boards/" + this.props.data.discriminator, getSimpleRequestConfig(this.context.user.session)).then(res => {
                if (res.status !== 200 && res.status !== 204) {
                    toastError();
                    return;
                }
                this.props.history.push("/me");
                toastSuccess("Board permanently deleted.", toastId);
            }).catch(err => {
                toastError(err.response.data.errors[0]);
            });
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
                axios.patch(this.context.apiRoute + "/boards/" + this.props.data.discriminator, {privatePage: state}, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 200) {
                        toastError();
                        return;
                    }
                    this.setState({privatePage: state});
                    toastSuccess("Board visibility toggled.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

    onChangesSave = () => {
        let banner = this.state.bannerInput;
        let logo = this.state.logoInput;
        let toastId = toastAwait("Saving changes...");
        axios.patch(this.context.apiRoute + "/boards/" + this.props.data.discriminator, {
            name: document.getElementById("boardTextarea").value,
            shortDescription: document.getElementById("shortDescrTextarea").value,
            fullDescription: document.getElementById("fullDescrTextarea").value,
            themeColor: this.context.theme,
            banner, logo,
        }, getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            toastSuccess("Settings successfully updated.", toastId);
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
            this.props.onLogoChange(data);
            this.setState({logoInput: data});
        });
    };

    onBannerChange = (e) => {
        if (!validateImageWithWarning(e, "bannerInput", 650)) {
            return;
        }
        let file = e.target.files[0];
        getBase64FromFile(file).then(data => {
            document.getElementById("boardBanner").style["background-image"] = "url('" + data + "')";
            this.setState({bannerInput: data});
        });
    };

}

export default GeneralSettings;