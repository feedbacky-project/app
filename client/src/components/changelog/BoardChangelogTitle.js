import axios from "axios";
import ChangelogUpdateModal from "components/changelog/ChangelogUpdateModal";
import DangerousActionModal from "components/commons/DangerousActionModal";
import {DropdownOption, IconToggle} from "components/commons/ModeratorActionsButton";
import {AppContext, BoardContext} from "context";
import React, {useContext, useState} from "react";
import {FaEdit, FaTrash} from "react-icons/all";
import {UiPrettyUsername} from "ui";
import {UiDropdown} from "ui/dropdown";
import {UiAvatar} from "ui/image";
import {popupError, popupNotification} from "utils/basic-utils";

const BoardChangelogTitle = ({data, onChangelogDelete, onChangelogUpdate}) => {
    const {user, getTheme} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const [modal, setModal] = useState({open: false, type: ""});
    const isModerator = boardData.moderators.find(mod => mod.userId === user.data.id);
    const doChangelogDelete = () => {
        return axios.delete("/changelog/" + data.id).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            popupNotification("Changelog deleted", getTheme());
            onChangelogDelete(data);
        });
    };
    const renderContent = () => {
        if(!isModerator) {
            return <React.Fragment/>
        }
        let color = getTheme();
        if (user.darkMode) {
            color = color.setAlpha(.8);
        }
        return <UiDropdown label={"Moderate Idea"} className={"d-inline mx-1"} toggleClassName={"text-black-60 p-0"} toggle={<IconToggle className={"align-baseline"}/>}>
            <DangerousActionModal id={"delete"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "delete"} onAction={doChangelogDelete}
                                  actionDescription={<div>Changelog will be permanently <u>deleted</u>.</div>}/>
            <ChangelogUpdateModal onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "update"} changelog={data} onChangelogUpdate={onChangelogUpdate}/>
            <DropdownOption onClick={() => setModal({open: true, type: "update"})} as={"span"}><FaEdit className={"mr-1 move-top-2px"} style={{color}}/> Update Changelog</DropdownOption>
            <DropdownOption onClick={() => setModal({open: true, type: "delete"})} as={"span"}><FaTrash className={"mr-1 move-top-2px"} style={{color}}/> Delete Changelog</DropdownOption>
        </UiDropdown>
    };
    const dateStr = new Date(data.creationDate).toLocaleString("default", {month: "short", year: "numeric", day: "numeric"});
    return <React.Fragment>
        <div style={{fontSize: "1.6em", fontWeight: "bold", display: "inline"}}>{data.title}</div>
        {renderContent()}
        <div className={"d-sm-inline-block d-block float-sm-right small text-black-60 text-sm-right text-left"}>
            {dateStr}
            <div>
                By {data.creator.username + " "} <UiAvatar size={16} user={data.creator} className={"align-top"} roundedCircle/>
            </div>
        </div>
    </React.Fragment>
};

export default BoardChangelogTitle;