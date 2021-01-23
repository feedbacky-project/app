import React, {useContext, useEffect, useState} from 'react';
import {Button, Col, OverlayTrigger, Tooltip} from "react-bootstrap";
import axios from "axios";
import {FaExclamation, FaTrashAlt} from "react-icons/fa";
import {toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import TagCreateModal from "components/modal/tag-create-modal";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import ViewBox from "components/viewbox/view-box";
import PageBadge from "components/app/page-badge";
import tinycolor from "tinycolor2";
import BoardContext from "context/board-context";
import {FaEyeSlash, FaPen, FaUserTag} from "react-icons/all";
import TagEditModal from "components/modal/tag-edit-modal";
import {SvgNotice} from "components/app/svg-notice";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import ExecutableButton from "../../../components/app/executable-button";
import AdminContext from "../../../context/admin-context";

const TagsSettings = () => {
    const context = useContext(AppContext);
    const boardContext = useContext(BoardContext);
    const {setCurrentNode} = useContext(AdminContext);
    const boardData = boardContext.data;
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const getQuota = () => 10 - boardData.tags.length;
    useEffect(() => setCurrentNode("tags"), []);
    const onTagCreate = (data) => {
        boardContext.updateTags(boardData.tags.concat(data));
    };
    const renderContent = () => {
        return <Col xs={12}>
            <span className="mr-1 text-black-60">Tags Quota ({getQuota()} left)</span>
            <ClickableTip id="quota" title="Tags Quota" description="Amount of tags your board can have, you're limited to 10 tags per board."/>
            {renderTags()}
            <br/>
            {renderNewTagButton()}
        </Col>
    };
    const renderTags = () => {
        if (boardData.tags.length === 0) {
            return <SvgNotice Component={UndrawNoData} title="No tags yet." description="How about creating one?"/>
        }
        return boardData.tags.map((tag, i) => {
            return <div key={i}>
                <PageBadge color={tinycolor(tag.color)} text={tag.name}/>
                {!tag.roadmapIgnored ||
                <OverlayTrigger overlay={<Tooltip id={"roadmapTag" + i + "-tooltip"}>Ignores Roadmap</Tooltip>}>
                    <FaEyeSlash className="fa-xs ml-1 red"/>
                </OverlayTrigger>}
                {!tag.publicUse ||
                <OverlayTrigger overlay={<Tooltip id={"publicTag" + i + "-tooltip"}>Publicly Accessible</Tooltip>}>
                    <FaUserTag className="fa-xs ml-1 blue"/>
                </OverlayTrigger>}
                <OverlayTrigger overlay={<Tooltip id={"deleteTag" + i + "-tooltip"}>Edit Tag</Tooltip>}>
                    <FaPen className="fa-xs ml-1 hoverable-option" onClick={() => onTagEdit(tag)}/>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip id={"deleteTag" + i + "-tooltip"}>Delete Tag</Tooltip>}>
                    <FaTrashAlt className="fa-xs ml-1 hoverable-option" onClick={() => onTagDelete(tag.name)}/>
                </OverlayTrigger>
            </div>
        });
    };
    const renderNewTagButton = () => {
        if (getQuota() <= 0) {
            return <OverlayTrigger overlay={<Tooltip id="quota-tooltip">Quota Limit Reached</Tooltip>}>
                <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}}><FaExclamation/> Add New</Button>
            </OverlayTrigger>
        }
        return <ExecutableButton className="m-0 mt-3 float-right" style={{backgroundColor: context.getTheme()}} onClick={() => {
            setModalOpen(true);
            return Promise.resolve();
        }}>Add New</ExecutableButton>
    };
    const onTagEdit = (tag) => {
        setEditData(tag);
        setEditModalOpen(true);
    };
    const onEdit = (oldTag, tag) => {
        const data = boardData.tags;
        const i = data.indexOf(oldTag);
        data[i] = tag;
        boardContext.updateTags(data);
    };
    const onTagDelete = (name) => {
        popupSwal("warning", "Dangerous action", "This action is <strong>irreversible</strong> and will delete tag from all ideas, please confirm your action.",
            "Delete Tag", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/boards/" + boardData.discriminator + "/tags/" + name).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    boardContext.updateTags(boardData.tags.filter(item => item.name !== name));
                    toastSuccess("Tag permanently deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    return <React.Fragment>
        <TagCreateModal onTagCreate={onTagCreate} onTagCreateModalClose={() => setModalOpen(false)} data={boardData} open={modalOpen}/>
        <TagEditModal open={editModalOpen} onClose={() => setEditModalOpen(false)} boardData={boardData} tag={editData} onEdit={onEdit}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="Tags Management" description="Edit your board tags here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default TagsSettings;