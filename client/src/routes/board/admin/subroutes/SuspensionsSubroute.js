import styled from "@emotion/styled";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import {SvgNotice} from "components/commons/SvgNotice";
import {BoardContext, PageNodesContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaTrash} from "react-icons/fa";
import {UiBadge, UiThemeContext} from "ui";
import {UiButton, UiElementDeleteButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiViewBox} from "ui/viewbox";
import {popupError, popupNotification, popupWarning} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const Suspended = styled.div`
  display: inline-flex;
  justify-content: center;
  margin: .5em;
`;

const SuspensionSettings = () => {
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData, updateState} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [modal, setModal] = useState({open: false, data: -1, dataName: ""});
    useEffect(() => setCurrentNode("suspended"), [setCurrentNode]);
    useTitle(boardData.name + " | Suspensions");

    const renderContent = () => {
        return <UiCol xs={12}>
            <UiFormLabel>Suspended Users</UiFormLabel>
            <div>
                 {renderSuspensions()}
            </div>
            <div>
                <UiButton label={"Add New"} className={"m-0 mt-3 float-right"} onClick={() => popupWarning("Suspend users manually through moderator tools")}>Add New</UiButton>
            </div>
        </UiCol>
    };
    const renderSuspensions = () => {
        if (boardData.suspendedUsers.length === 0) {
            return <SvgNotice Component={UndrawNoData} title={"No suspensions yet."} description={"Lets hope nobody will never appear here."}/>
        }
        return boardData.suspendedUsers.map((suspendedUser, i) => {
            const onDelete = () => setModal({open: true, data: suspendedUser.id, dataName: suspendedUser.user.username});
            return <Suspended key={i}>
                <div className={"text-center"}>
                    <UiAvatar roundedCircle user={suspendedUser.user} size={35}/>
                    <UiElementDeleteButton id={"mod_del_" + i} tooltipName={"Unsuspend"} onClick={onDelete}/>
                    <br/>
                    <small className={"text-truncate d-block"} style={{maxWidth: 100}}>{suspendedUser.user.username}</small>
                </div>
            </Suspended>
        });
    };
    const onUnsuspension = () => {
        return axios.delete("/suspendedUsers/" + modal.data).then(res => {
            if (res.status !== 204) {
                popupError("Failed to unsuspend the user");
                return;
            }
            const suspendedUsers = boardData.suspendedUsers.filter(item => item.id !== modal.data);
            popupNotification("User suspended", getTheme());
            updateState({...boardData, suspendedUsers: suspendedUsers});
        });
    };
    return <UiCol xs={12}>
        <DangerousActionModal id={"suspensionDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onUnsuspension}
                              actionButtonName={"Unsuspend"} Icon={FaTrash}
                              actionDescription={<div>User <UiBadge>{modal.dataName}</UiBadge> will no longer be suspended and will be able to give feedback again.</div>}/>
        <UiViewBox title={"Suspensions Management"} description={"Manage suspended users here."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default SuspensionSettings;