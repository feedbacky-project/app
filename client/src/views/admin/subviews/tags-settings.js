import React, {useContext, useEffect, useState} from 'react';
import {Button, Col, OverlayTrigger, Tooltip} from "react-bootstrap";
import axios from "axios";
import {FaExclamation, FaTrashAlt} from "react-icons/fa";
import {toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import TagCreateModal from "components/modal/tag-create-modal";
import AdminSidebar from "components/sidebar/admin-sidebar";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import ViewBox from "components/viewbox/view-box";
import PageBadge from "components/app/page-badge";
import tinycolor from "tinycolor2";
import ComponentLoader from "components/app/component-loader";
import BoardContext from "context/board-context";
import {FaEyeSlash, FaPen} from "react-icons/all";
import TagEditModal from "components/modal/tag-edit-modal";
import {SvgNotice} from "components/app/svg-notice";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";

const TagsSettings = ({reRouteTo}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const [tags, setTags] = useState({data: [], loaded: false, error: false});
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const getQuota = () => 10 - tags.data.length;
    useEffect(() => {
        axios.get("/boards/" + boardData.discriminator + "/tags").then(res => {
            if (res.status !== 200) {
                setTags({...tags, error: true});
                return;
            }
            setTags({...tags, data: res.data, loaded: true});
        }).catch(() => setTags({...tags, error: true}));
        // eslint-disable-next-line
    }, []);
    const onTagCreateModalClick = () => setModalOpen(true);
    const onTagCreateModalClose = () => setModalOpen(false);
    const onTagCreate = (name, color, roadmapIgnored) => {
        const data = tags.data.concat({name, color, roadmapIgnored});
        setTags({...tags, data});
    };
    const renderContent = () => {
        if (tags.error) {
            return <span className="text-danger">Failed to obtain tags data</span>
        }
        return <ComponentLoader loaded={tags.loaded} component={
            <Col xs={12}>
                <span className="mr-1 text-black-60">Tags Quota ({getQuota()} left)</span>
                <ClickableTip id="quota" title="Tags Quota" description="Amount of tags your board can have, you're limited to 10 tags per board."/>
                {renderTags()}
                <br/>
                {renderNewTagButton()}
            </Col>
        }/>
    };
    const renderTags = () => {
        if(tags.data.length === 0) {
            return <SvgNotice Component={UndrawNoData} title="No tags yet." description="How about creating one?"/>
        }
        return tags.data.map((tag, i) => {
            return <div key={i}>
                <PageBadge color={tinycolor(tag.color)} text={tag.name}/>
                {!tag.roadmapIgnored ||
                <OverlayTrigger overlay={<Tooltip id={"infoTag" + i + "-tooltip"}>Ignores Roadmap</Tooltip>}>
                    <FaEyeSlash className="fa-xs ml-1 red"/>
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
        return <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: context.getTheme()}} onClick={onTagCreateModalClick}>Add New</Button>
    };
    const onTagEdit = (tag) => {
        setEditData(tag);
        setEditModalOpen(true);
    };
    const onEdit = (oldTag, tag) => {
        const data = tags.data;
        const i = data.indexOf(oldTag);
        data[i] = tag;
        setTags({...tags, data});
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
                    const data = tags.data.filter(item => item.name !== name);
                    setTags({...tags, data});
                    toastSuccess("Tag permanently deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
    return <React.Fragment>
        <AdminSidebar currentNode="tags" reRouteTo={reRouteTo} data={boardData}/>
        <TagCreateModal onTagCreate={onTagCreate} onTagCreateModalClose={onTagCreateModalClose} data={boardData} open={modalOpen}/>
        <TagEditModal open={editModalOpen} onClose={() => setEditModalOpen(false)} boardData={boardData} tag={editData} onEdit={onEdit}/>
        <Col xs={12} md={9}>
            <ViewBox theme={context.getTheme()} title="Tags Management" description="Edit your board tags here.">
                {renderContent()}
            </ViewBox>
        </Col>
    </React.Fragment>
};

export default TagsSettings;