import styled from "@emotion/styled";
import axios from "axios";
import ChangelogUpdateModal from "components/changelog/ChangelogUpdateModal";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import {DropdownOption, IconToggle} from "components/commons/ModeratorActionsButton";
import {AppContext, BoardContext} from "context";
import React, {useContext, useState} from "react";
import {FaEdit, FaTrash} from "react-icons/fa";
import {UiThemeContext} from "ui";
import {UiDropdown} from "ui/dropdown";
import {UiAvatar} from "ui/image";
import {popupError, popupNotification} from "utils/basic-utils";

const ChangelogTitle = styled.div`
  display: inline;
  font-size: 1.6em;
  font-weight: bold;
  word-break: break-word;
`;

const BoardChangelogTitle = ({data, onChangelogDelete, onChangelogUpdate}) => {
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData} = useContext(BoardContext);
    const [modal, setModal] = useState({open: false, type: ""});
    const isModerator = boardData.moderators.find(mod => mod.userId === user.data.id);

    const doChangelogDelete = () => {
        return axios.delete("/changelogs/" + data.id).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            popupNotification("Changelog deleted", getTheme());
            onChangelogDelete(data);
        });
    };
    const renderContent = () => {
        if (!isModerator) {
            return <React.Fragment/>
        }
        let color = getTheme();
        if (user.darkMode) {
            color = color.setAlpha(.8);
        }
        return <UiDropdown label={"Moderate Idea"} className={"d-inline mx-1"} toggleClassName={"text-black-60 p-0"} toggle={<IconToggle className={"align-baseline"}/>}>
            <DangerousActionModal id={"delete"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "delete"} onAction={doChangelogDelete}
                                  actionDescription={<div>Changelog will be permanently <u>deleted</u>.</div>} Icon={FaTrash}/>
            <ChangelogUpdateModal onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "update"} changelog={data} onChangelogUpdate={onChangelogUpdate}/>
            <DropdownOption onClick={() => setModal({open: true, type: "update"})} as={"span"}><FaEdit className={"mr-1 move-top-2px"} style={{color}}/> Update Changelog</DropdownOption>
            <DropdownOption onClick={() => setModal({open: true, type: "delete"})} as={"span"}><FaTrash className={"mr-1 move-top-2px"} style={{color}}/> Delete Changelog</DropdownOption>
        </UiDropdown>
    };
    const dateStr = new Date(data.creationDate).toLocaleString("default", {month: "short", year: "numeric", day: "numeric"});
    return <React.Fragment>
        <ChangelogTitle>{data.title}</ChangelogTitle>
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