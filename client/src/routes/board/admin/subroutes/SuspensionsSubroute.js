import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import DangerousActionModal from "components/commons/DangerousActionModal";
import {SvgNotice} from "components/commons/SvgNotice";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import React, {useContext, useEffect, useState} from "react";
import {UiBadge} from "ui";
import {UiButton, UiElementDeleteButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiViewBox} from "ui/viewbox";
import {popupError, popupNotification, popupWarning} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const SuspensionSettings = () => {
    const {getTheme} = useContext(AppContext);
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
            return <div className={"d-inline-flex justify-content-center mr-2"} key={i}>
                <div className={"text-center"}>
                    <UiAvatar roundedCircle user={suspendedUser.user} size={35}/>
                    <UiElementDeleteButton id={"mod_del_" + i} tooltipName={"Unsuspend"}
                                           onClick={() => setModal({open: true, data: suspendedUser.id, dataName: suspendedUser.user.username})}/>
                    <br/>
                    <small className={"text-truncate d-block"} style={{maxWidth: 100}}>{suspendedUser.user.username}</small>
                </div>
            </div>
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
    return <UiCol xs={12} md={9}>
        <DangerousActionModal id={"suspensionDel"} onHide={() => setModal({...modal, open: false})} isOpen={modal.open} onAction={onUnsuspension}
                              actionButtonName={"Unsuspend"}
                              actionDescription={<div>User <UiBadge>{modal.dataName}</UiBadge> will no longer be suspended and will be able to give feedback again.</div>}/>
        <UiViewBox title={"Suspensions Management"} description={"Manage suspended users here."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default SuspensionSettings;