import React, {useContext} from 'react';
import {Badge, Dropdown, Form} from "react-bootstrap";
import PropTypes from "prop-types";
import {FaLock, FaTags, FaTrash, FaUnlock} from "react-icons/fa";
import axios from "axios";
import {getSimpleRequestConfig, toastError, toastSuccess} from "../util/utils";
import swalReact from "sweetalert2-react-content";
import Swal from "sweetalert2";
import AppContext from "../../context/app-context";
import {popupSwal} from "../util/sweetalert-utils";
import {FaEllipsisH} from "react-icons/all";

const ModeratorActions = (props) => {
    const swalGenerator = swalReact(Swal);
    const context = useContext(AppContext);
    const visible = props.moderators.find(mod => mod.userId === context.user.data.id);
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
            axios.patch(context.apiRoute + "/ideas/" + props.ideaData.id, {
                "open": true
            }, getSimpleRequestConfig(context.user.session)).then(res => {
                if (res.status !== 200 && res.status !== 204) {
                    toastError();
                    return;
                }
                props.onStateChange(true);
                toastSuccess("Idea opened.");
            }).catch(err => toastError(err.response.data.errors[0]))
        });
    };
    const onIdeaClose = () => {
        popupSwal("question", "Please confirm", "Once you close idea you can open it again.",
            "Close Idea", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.patch(context.apiRoute + "/ideas/" + props.ideaData.id, {
                    "open": false
                }, getSimpleRequestConfig(context.user.session)).then(res => {
                    if (res.status !== 200 && res.status !== 204) {
                        toastError();
                        return;
                    }
                    props.onStateChange(false);
                    toastSuccess("Idea closed.");
                }).catch(err => toastError(err.response.data.errors[0]))
            });
    };
    const onIdeaDelete = () => {
        popupSwal("warning", "Dangerous action", "This action is <strong>irreversible</strong> and will delete the idea, please confirm your action.",
            "Delete Idea", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(context.apiRoute + "/ideas/" + props.ideaData.id, getSimpleRequestConfig(context.user.session)).then(res => {
                    if (res.status !== 200 && res.status !== 204) {
                        toastError();
                        return;
                    }
                    toastSuccess("Idea permanently deleted.");
                    props.onIdeaDelete(props.ideaData.id);
                }).catch(err => toastError(err.response.data.errors[0]))
            });
    };
    const onTagsManage = () => {
        axios.get(context.apiRoute + "/boards/" + props.ideaData.boardDiscriminator + "/tags", getSimpleRequestConfig(context.user.session)).then(res => {
            let html = [];
            res.data.forEach((tag, i) => {
                const applied = props.ideaData.tags.find(ideaTag => ideaTag.name === tag.name);
                html.push(<Form.Check id={"tagManage_" + tag.name} key={i} custom inline label={<Badge key={i} color="" style={{
                    transform: `translateY(1px)`,
                    backgroundColor: tag.color
                }}>{tag.name}</Badge>} type="checkbox" defaultChecked={applied}/>)
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
                    axios.patch(context.apiRoute + "/ideas/" + props.ideaData.id + "/tags", data,
                        getSimpleRequestConfig(context.user.session)).then(response => {
                        if (response.status !== 200 && response.status !== 204) {
                            toastError();
                            return;
                        }
                        props.onTagsUpdate(response.data);
                        toastSuccess("Tags updated!");
                    }).catch(err => toastError(err.response.data.errors[0]));
                }
            });
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    if (!visible) {
        return <React.Fragment/>;
    }
    return <Dropdown alignRight className="cursor-click" onClick={e => e.preventDefault()} as={"span"}>
        <Dropdown.Toggle as={"span"} id={props.ideaData.id + "_mod_tools"} variant="" className="text-black-60 ml-1 dropdown-toggle-off">
            <FaEllipsisH className="fa-sm move-top-2px"/>
        </Dropdown.Toggle>
        <Dropdown.Menu className="mod-tools">
            <Dropdown.Item as={"span"} onClick={onTagsManage}><FaTags className="fa-sm mr-1" style={{color: context.theme}}/> Change Tags</Dropdown.Item>
            {props.ideaData.open ?
                <Dropdown.Item as={"span"} onClick={onIdeaClose}><FaLock className="fa-sm mr-1" style={{color: context.theme}}/> Close Idea</Dropdown.Item> :
                <Dropdown.Item as={"span"} onClick={onIdeaOpen}><FaUnlock className="fa-sm mr-1" style={{color: context.theme}}/> Open Idea</Dropdown.Item>
            }
            <Dropdown.Item as={"span"} onClick={onIdeaDelete}><FaTrash className="fa-sm mr-1" style={{color: context.theme}}/> Delete Idea</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
};

ModeratorActions.propTypes = {
    moderators: PropTypes.array,
    ideaData: PropTypes.object,
    onTagsUpdate: PropTypes.func,
    onIdeaDelete: PropTypes.func,
    onStateChange: PropTypes.func,
};

export default ModeratorActions;