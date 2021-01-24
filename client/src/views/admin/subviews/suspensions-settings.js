import React, {useContext, useEffect} from "react";
import AppContext from "context/app-context";
import BoardContext from "context/board-context";
import axios from "axios";
import {Col} from "react-bootstrap";
import {SvgNotice} from "components/app/svg-notice";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import PageAvatar from "components/app/page-avatar";
import {toastAwait, toastError, toastSuccess, toastWarning} from "components/util/utils";
import DeleteButton from "components/util/delete-button";
import {popupSwal} from "components/util/sweetalert-utils";
import ViewBox from "components/viewbox/view-box";
import PageNodesContext from "../../../context/page-nodes-context";
import PageButton from "../../../components/app/page-button";

const SuspensionSettings = () => {
    const context = useContext(AppContext);
    const boardContext = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    useEffect(() => setCurrentNode("suspensions"), []);
    const renderContent = () => {
        return <Col xs={12}>
            <div className="mb-1 text-black-60">Suspended Users</div>
            {renderSuspensions()}
            <div>
                <PageButton color={context.getTheme()} className="m-0 mt-3 float-right"
                            onClick={() => toastWarning("Suspend users manually through moderator tools.")}>Add New</PageButton>
            </div>
        </Col>
    };
    const renderSuspensions = () => {
        if (boardContext.data.suspendedUsers.length === 0) {
            return <SvgNotice Component={UndrawNoData} title="No suspensions yet." description="Lets hope nobody will never appear here."/>
        }
        return boardContext.data.suspendedUsers.map((suspendedUser, i) => {
            return <div className="d-inline-flex justify-content-center mr-2" key={i}>
                <div className="text-center">
                    <PageAvatar roundedCircle user={suspendedUser.user} size={35}/>
                    <DeleteButton id={"mod_del_" + i} onClick={() => onUnsuspension(suspendedUser)} tooltipName="Unsuspend"/>
                    <br/>
                    <small className="text-truncate d-block" style={{maxWidth: 100}}>{suspendedUser.user.username}</small>
                </div>
            </div>
        });
    };
    const onUnsuspension = (suspendedUser) => {
        popupSwal("question", "Are you sure?", "This user will no longer be suspended and will be able to give feedback again.",
            "Unsuspend", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                const id = toastAwait("Pending unsuspension...");
                axios.delete("/suspendedUsers/" + suspendedUser.id).then(res => {
                    if (res.status !== 204) {
                        toastError("Failed to unsuspend the user", id);
                        return;
                    }
                    const data = boardContext.data.suspendedUsers.filter(item => item.id !== suspendedUser.id);
                    toastSuccess("User unsuspended.", id);
                    boardContext.updateSuspensions(data);
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    return <Col xs={12} md={9}>
        <ViewBox theme={context.getTheme()} title="Suspensions Management" description="Manage suspended users here.">
            {renderContent()}
        </ViewBox>
    </Col>
};

export default SuspensionSettings;