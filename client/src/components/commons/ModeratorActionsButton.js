import styled from "@emotion/styled";
import axios from "axios";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import PropTypes from "prop-types";
import React, {useContext} from 'react';
import {Form} from "react-bootstrap";
import {FaCog, FaUserLock} from "react-icons/all";
import {FaLock, FaTags, FaTrash, FaUnlock} from "react-icons/fa";
import {useHistory} from "react-router-dom";
import Swal from "sweetalert2";
import swalReact from "sweetalert2-react-content";
import tinycolor from "tinycolor2";
import UiDropdown from "ui/dropdown/UiDropdown";
import UiDropdownElement from "ui/dropdown/UiDropdownElement";
import UiBadge from "ui/UiBadge";
import {toastAwait, toastError, toastSuccess} from "utils/basic-utils";
import {popupSwal} from "utils/sweetalert-utils";

const IconToggle = styled(FaCog)`
  transition: all 0.7s ease-in-out 0s;
  color: var(--pure-dark-half);
  
  &:hover {
    color: var(--pure-dark-half);
    transform: rotate(360deg);
    transition: all 0.7s ease-in-out 0s;
  }
  
  .dark &, .dark &:hover {
    color: hsla(0, 0%, 95%, .5);
  }
`;

const DropdownOption = styled(UiDropdownElement)`
  cursor: pointer;
`;

const ModeratorActionsButton = ({onIdeaDelete = () => void 0}) => {
    const swalGenerator = swalReact(Swal);
    const context = useContext(AppContext);
    const {user, getTheme} = useContext(AppContext);
    const {data: boardData, updateState: updateBoardState} = useContext(BoardContext);
    const {ideaData, updateState} = useContext(IdeaContext);
    const history = useHistory();
    const visible = boardData.moderators.find(mod => mod.userId === user.data.id);
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
                axios.post("/boards/" + boardData.discriminator + "/suspendedUsers", {
                    userId: ideaData.user.id,
                    suspensionEndDate: (date.getFullYear() + 10) + "-" + (date.getMonth() + 1) + "-" + date.getDate()
                }).then(res => {
                    if (res.status !== 201) {
                        toastError("Failed to suspend the user.", id);
                        return;
                    }
                    toastSuccess("User suspended.", id);
                    updateBoardState({suspendedUsers: boardData.suspendedUsers.concat(res.data)});
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    const onTagsManage = () => {
        let html = [];
        boardData.tags.forEach((tag, i) => {
            const applied = ideaData.tags.find(ideaTag => ideaTag.name === tag.name);
            html.push(<Form.Check id={"tagManage_" + tag.name} key={i} custom inline label={<UiBadge color={tinycolor(tag.color)} text={tag.name} context={context}/>}
                                  type={"checkbox"} defaultChecked={applied}/>)
        });
        swalGenerator.fire({
            html: <React.Fragment>
                Choose tags to add or remove and click Update to confirm.
                <br className={"mb-3"}/>
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
                boardData.tags.forEach((tag) => {
                    let tagName = tag.name;
                    let obj = document.getElementById("tagManage_" + tagName);
                    data.push({name: tagName, apply: obj.checked});
                });
                axios.patch("/ideas/" + ideaData.id + "/tags", data).then(res => {
                    if (res.status !== 200 && res.status !== 204) {
                        toastError();
                        return;
                    }
                    updateState({...ideaData, tags: res.data});
                    toastSuccess("Tags updated!");
                }).catch(err => toastError(err.response.data.errors[0]));
            }
        });
    };
    const isSuspendable = () => {
        if (boardData.moderators.find(mod => mod.user.id === ideaData.user.id)) {
            return false;
        }
        return !boardData.suspendedUsers.find(suspended => suspended.user.id === ideaData.user.id);
    };

    if (!visible) {
        return <React.Fragment/>;
    }
    let color = getTheme();
    if (user.darkMode) {
        color = color.setAlpha(.8);
    }
    return <UiDropdown className={"d-inline"} toggleClassName={"text-black-60 p-0"} toggle={<IconToggle className={"align-baseline cursor-click"}/>}>
        <DropdownOption onClick={onTagsManage} as={"span"}><FaTags className={"mr-1 move-top-2px"} style={{color}}/> Change Tags</DropdownOption>
        {ideaData.open ?
            <DropdownOption onClick={onIdeaClose} as={"span"}><FaLock className={"mr-1 move-top-2px"} style={{color}}/> Close Idea</DropdownOption> :
            <DropdownOption onClick={onIdeaOpen} as={"span"}><FaUnlock className={"mr-1 move-top-2px"} style={{color}}/> Open Idea</DropdownOption>
        }
        <DropdownOption onClick={doIdeaDelete} as={"span"}><FaTrash className={"mr-1 move-top-2px"} style={{color}}/> Delete Idea</DropdownOption>
        {isSuspendable() && <DropdownOption onClick={doSuspendUser} className={"text-danger"} as={"span"}>
            <FaUserLock className={"mr-1 move-top-2px"} style={{color: getTheme()}}/> Suspend User
        </DropdownOption>
        }
    </UiDropdown>
};

ModeratorActionsButton.propTypes = {
    onIdeaDelete: PropTypes.func
};

export default ModeratorActionsButton;