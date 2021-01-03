import React, {useContext} from "react";
import AppContext from "context/app-context";
import BoardContext from "context/board-context";
import axios from "axios";
import {Button, Col, OverlayTrigger, Tooltip} from "react-bootstrap";
import {SvgNotice} from "components/app/svg-notice";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {PageAvatar} from "components/app/page-avatar";
import {toastAwait, toastError, toastSuccess} from "components/util/utils";
import DeleteButton from "components/util/delete-button";
import {popupSwal} from "components/util/sweetalert-utils";
import AdminSidebar from "components/sidebar/admin-sidebar";
import ViewBox from "components/viewbox/view-box";

const SuspensionSettings = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const boardContext = useContext(BoardContext);
    const renderContent = () => {
        return <Col xs={12}>
            <div className="mb-1 text-black-60">Suspended Users</div>
            {renderSuspensions()}
            <div>
                <OverlayTrigger overlay={<Tooltip id={"suspensionButtonSoon"}>Suspend users manually through moderator tools.</Tooltip>}>
                    <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}} disabled>Add New</Button>
                </OverlayTrigger>
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
                    <PageAvatar roundedCircle url={suspendedUser.user.avatar} size={35} username={suspendedUser.user.username}/>
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
    return <React.Fragment>
        <AdminSidebar currentNode="suspended" reRouteTo={reRouteTo} data={boardContext.data}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="Suspensions Management" description="Manage suspended users here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default SuspensionSettings;