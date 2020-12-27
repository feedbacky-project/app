import React, {useContext} from 'react';
import {Dropdown, Form} from "react-bootstrap";
import PropTypes from "prop-types";
import {FaLock, FaTags, FaTrash, FaUnlock} from "react-icons/fa";
import axios from "axios";
import {toastAwait, toastError, toastSuccess} from "components/util/utils";
import swalReact from "sweetalert2-react-content";
import Swal from "sweetalert2";
import AppContext from "context/app-context";
import {popupSwal} from "components/util/sweetalert-utils";
import {FaEllipsisH, FaUserLock} from "react-icons/all";
import {useHistory} from "react-router-dom";
import PageBadge from "components/app/page-badge";
import tinycolor from "tinycolor2";
import BoardContext from "context/board-context";

const ModeratorActions = ({
                              ideaData, updateState, onIdeaDelete = () => {
    }
                          }) => {
    const swalGenerator = swalReact(Swal);
    const context = useContext(AppContext);
    const boardContext = useContext(BoardContext);
    const history = useHistory();
    const visible = boardContext.data.moderators.find(mod => mod.userId === context.user.data.id);
    const onIdeaOpen = () => {
        swalGenerator.fire({
            title: "Please confirm",
            html: "Once you reopen idea you can close it again.",
            icon: "question",
            showCancelButton: true,
            animation: false,
            confirmButtonColor: "#d33",
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Open Idea",
        }).then(willClose => {
            if (!willClose.value) {
                return;
            }
            axios.patch("/ideas/" + ideaData.id, {"open": true}).then(res => {
                if (res.status !== 200 && res.status !== 204) {
                    toastError();
                    return;
                }
                updateState({...ideaData, open: true});
                toastSuccess("Idea opened.");
            }).catch(err => toastError(err.response.data.errors[0]));
        });
    };
    const onIdeaClose = () => {
        popupSwal("question", "Please confirm", "Once you close idea you can open it again.",
            "Close Idea", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.patch("/ideas/" + ideaData.id, {"open": false}).then(res => {
                    if (res.status !== 200 && res.status !== 204) {
                        toastError();
                        return;
                    }
                    updateState({...ideaData, open: false});
                    toastSuccess("Idea closed.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    const doIdeaDelete = () => {
        popupSwal("warning", "Dangerous action", "This action is <strong>irreversible</strong> and will delete the idea, please confirm your action.",
            "Delete Idea", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/ideas/" + ideaData.id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    toastSuccess("Idea permanently deleted.");
                    history.push("/b/" + ideaData.boardDiscriminator);
                    onIdeaDelete();
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    const doSuspendUser = () => {
        popupSwal("warning", "Dangerous action", "Suspended users cannot post new ideas and upvote/downvote ideas unless unsuspended through board admin panel.",
            "Suspend", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                //todo finite suspension dates
                const date = new Date();
                const id = toastAwait("Pending suspension...");
                axios.post("/boards/" + boardContext.data.discriminator + "/suspendedUsers", {
                    userId: ideaData.user.id,
                    suspensionEndDate: (date.getFullYear() + 10) + "-" + (date.getMonth() + 1) + "-" + date.getDate()
                }).then(res => {
                    if (res.status !== 201) {
                        toastError("Failed to suspend the user.", id);
                        return;
                    }
                    toastSuccess("User suspended.", id);
                    boardContext.updateSuspensions(boardContext.data.suspendedUsers.concat(res.data));
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    const onTagsManage = () => {
        axios.get("/boards/" + ideaData.boardDiscriminator + "/tags").then(res => {
            let html = [];
            res.data.forEach((tag, i) => {
                const applied = ideaData.tags.find(ideaTag => ideaTag.name === tag.name);
                html.push(<Form.Check id={"tagManage_" + tag.name} key={i} custom inline label={<PageBadge color={tinycolor(tag.color)} text={tag.name} context={context}/>}
                                      type="checkbox" defaultChecked={applied}/>)
            });
            swalGenerator.fire({
                html: <React.Fragment>
                    Choose tags to add or remove and click Update to confirm.
                    <br className="mb-3"/>
                    <Form>
                        {html.map(data => {
                            return data;
                        })}
                    </Form>
                </React.Fragment>,
                icon: "info",
                showCancelButton: true,
                animation: false,
                reverseButtons: true,
                focusCancel: true,
                confirmButtonText: "Update",
                preConfirm: () => {
                    let data = [];
                    res.data.forEach((tag) => {
                        let tagName = tag.name;
                        let obj = document.getElementById("tagManage_" + tagName);
                        data.push({name: tagName, apply: obj.checked});
                    });
                    axios.patch("/ideas/" + ideaData.id + "/tags", data).then(response => {
                        if (response.status !== 200 && response.status !== 204) {
                            toastError();
                            return;
                        }
                        updateState({...ideaData, tags: response.data});
                        toastSuccess("Tags updated!");
                    }).catch(err => toastError(err.response.data.errors[0]));
                }
            });
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    const isSuspendable = () => {
        if(boardContext.data.moderators.find(mod => mod.user.id === ideaData.user.id)) {
            return false;
        }
        return !boardContext.data.suspendedUsers.find(suspended => suspended.user.id === ideaData.user.id);
    };

    if (!visible) {
        return <React.Fragment/>;
    }
    return <Dropdown alignRight onClick={e => e.preventDefault()} as={"span"}>
        <Dropdown.Toggle as={"span"} id={ideaData.id + "_mod_tools"} variant="" className="text-black-60 ml-1">
            <FaEllipsisH className="move-top-1px cursor-click"/>
        </Dropdown.Toggle>
        <Dropdown.Menu className="mod-tools">
            <Dropdown.Item as={"span"} onClick={onTagsManage}><FaTags className="mr-1 move-top-2px" style={{color: context.getTheme()}}/> Change Tags</Dropdown.Item>
            {ideaData.open ?
                <Dropdown.Item as={"span"} onClick={onIdeaClose}><FaLock className="mr-1 move-top-2px" style={{color: context.getTheme()}}/> Close Idea</Dropdown.Item> :
                <Dropdown.Item as={"span"} onClick={onIdeaOpen}><FaUnlock className="mr-1 move-top-2px" style={{color: context.getTheme()}}/> Open Idea</Dropdown.Item>
            }
            <Dropdown.Item as={"span"} onClick={doIdeaDelete}><FaTrash className="mr-1 move-top-2px" style={{color: context.getTheme()}}/> Delete Idea</Dropdown.Item>
            {isSuspendable() && <Dropdown.Item as={"span"} onClick={doSuspendUser} className="text-danger">
                <FaUserLock className="mr-1 move-top-2px" style={{color: context.getTheme()}}/> Suspend User
            </Dropdown.Item>
            }
        </Dropdown.Menu>
    </Dropdown>
};

ModeratorActions.propTypes = {
    ideaData: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
    onIdeaDelete: PropTypes.func
};

export default ModeratorActions;