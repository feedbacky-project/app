import React, {useContext, useEffect, useState} from "react";
import AppContext from "context/app-context";
import BoardContext from "context/board-context";
import axios from "axios";
import ComponentLoader from "components/app/component-loader";
import {Button, Col, OverlayTrigger, Tooltip} from "react-bootstrap";
import {SvgNotice} from "components/app/svg-notice";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {PageAvatar} from "components/app/page-avatar";
import {toastError, toastSuccess} from "components/util/utils";
import DeleteButton from "components/util/delete-button";
import {popupSwal} from "components/util/sweetalert-utils";
import AdminSidebar from "components/sidebar/admin-sidebar";
import ViewBox from "components/viewbox/view-box";

const SuspensionSettings = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const [suspended, setSuspended] = useState({data: [], loaded: false, error: false});
    useEffect(() => {
        axios.get("/boards/" + boardData.discriminator + "/suspendedUsers").then(res => {
            if (res.status !== 200) {
                setSuspended({...suspended, error: true});
                return;
            }
            setSuspended({...suspended, data: res.data, loaded: true});
        }).catch(() => setSuspended({...suspended, error: true}));
        // eslint-disable-next-line
    }, []);
    const renderContent = () => {
        if (suspended.error) {
            return <span className="text-danger">Failed to obtain suspended data</span>
        }
        return <ComponentLoader loaded={suspended.loaded} component={
            <Col xs={12}>
                <span className="mr-1 text-black-60">Suspended Users</span>
                <Col xs={12} sm={6} className="mb-sm-0 mb-3">
                    {renderSuspensions()}
                </Col>
                <Col xs={12}>
                    <OverlayTrigger overlay={<Tooltip id={"suspensionButtonSoon"}>Suspend users manually through moderator tools.</Tooltip>}>
                        <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}} disabled>Add New</Button>
                    </OverlayTrigger>
                </Col>
            </Col>
        }/>
    };
    const renderSuspensions = () => {
        if (suspended.data.length === 0) {
            return <SvgNotice Component={UndrawNoData} title="No suspensions yet." description="Lets hope nobody will never appear here."/>
        }
        return suspended.data.map((suspended, i) => {
            return <div className="d-inline-flex justify-content-center mr-2" key={i}>
                <div className="text-center">
                    <PageAvatar roundedCircle url={suspended.user.avatar} size={35}/>
                    <DeleteButton id={"mod_del_" + i} onClick={() => onUnsuspension(suspended)} tooltipName="Unsuspend"/>
                    <br/>
                    <small className="text-truncate d-block" style={{maxWidth: 100}}>{suspended.user.username}</small>
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
                axios.delete("/suspendedUsers/" + suspendedUser.id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const data = suspended.data.filter(item => item.id !== suspendedUser.id);
                    setSuspended({...suspended, data});
                    toastSuccess("User unsuspended.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    return <React.Fragment>
        <AdminSidebar currentNode="suspended" reRouteTo={reRouteTo} data={boardData}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="Suspensions Management" description="Manage suspended users here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default SuspensionSettings;