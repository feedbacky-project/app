import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import TagCreateModal from "components/board/admin/TagCreateModal";
import TagEditModal from "components/board/admin/TagEditModal";
import DangerousActionModal from "components/commons/DangerousActionModal";
import {SvgNotice} from "components/commons/SvgNotice";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import PageNodesContext from "context/PageNodesContext";
import React, {useContext, useEffect, useState} from 'react';
import {FaEyeSlash, FaPen, FaUserTag} from "react-icons/all";
import {FaTrashAlt} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiBadge, UiHoverableIcon, UiTooltip} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {popupError, popupNotification} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const TagsSubroute = () => {
    const {getTheme} = useContext(AppContext);
    const {data: boardData, updateState} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [modal, setModal] = useState({open: false, type: "", data: {name: ""}});
    useEffect(() => setCurrentNode("tags"), [setCurrentNode]);
    useTitle(boardData.name + " | Tags");
    const onTagCreate = (data) => {
        updateState({...boardData, tags: boardData.tags.concat(data)});
    };
    const renderContent = () => {
        return <UiCol xs={12}>
            <UiFormLabel>Created Tags</UiFormLabel>
            <UiRow>{renderTags()}</UiRow>
            <UiLoadableButton label={"Add New"} className={"mt-3 float-right"} onClick={() => {
                setModal({open: true, type: "new", data: {name: ""}});
                return Promise.resolve();
            }}>Add New</UiLoadableButton>
        </UiCol>
    };
    const renderTags = () => {
        if (boardData.tags.length === 0) {
            return <SvgNotice Component={UndrawNoData} title={"No tags yet."} description={"How about creating one?"}/>
        }
        return boardData.tags.map((tag, i) => {
            return <UiCol xs={6} key={i}>
                <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>
                {!tag.roadmapIgnored ||
                <UiTooltip id={"tag" + i + "map"} text={"Ignores Roadmap"}>
                    <UiHoverableIcon as={FaEyeSlash} className={"text-red ml-1"}/>
                </UiTooltip>}
                {!tag.publicUse ||
                <UiTooltip id={"tag" + i + "public"} text={"Publicly Accessible"}>
                    <UiHoverableIcon as={FaUserTag} className={"text-blue ml-1"}/>
                </UiTooltip>}
                <UiTooltip id={"tag" + i + "edit"} text={"Edit Tag"}>
                    <UiHoverableIcon as={FaPen} onClick={() => onTagEdit(tag)} className={"ml-1"}/>
                </UiTooltip>
                <UiTooltip id={"tag" + i + "delete"} text={"Delete Tag"}>
                    <UiHoverableIcon as={FaTrashAlt} onClick={() => setModal({open: true, type: "delete", data: {name: tag.name, color: tinycolor(tag.color)}})}
                                     className={"ml-1"}/>
                </UiTooltip>
            </UiCol>
        });
    };
    const onTagEdit = (tag) => {
        setModal({open: true, type: "edit", data: tag});
    };
    const onEdit = (oldTag, tag) => {
        const tags = boardData.tags;
        const i = tags.indexOf(oldTag);
        tags[i] = tag;
        updateState({...boardData, tags});
    };
    const onTagDelete = () => {
        return axios.delete("/boards/" + boardData.discriminator + "/tags/" + modal.data.name).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            updateState({...boardData, tags: boardData.tags.filter(item => item.name !== modal.data.name)});
            popupNotification("Tag deleted", getTheme());
        });
    };
    return <UiCol xs={12} md={9}>
        <TagCreateModal isOpen={modal.open && modal.type === "new"} onTagCreate={onTagCreate} onHide={() => setModal({...modal, open: false})}/>
        <TagEditModal isOpen={modal.open && modal.type === "edit"} onHide={() => setModal({...modal, open: false})} tag={modal.data} onEdit={onEdit}/>
        <DangerousActionModal isOpen={modal.open && modal.type === "delete"} id={"tagDel"} onHide={() => setModal({...modal, open: false})} onAction={onTagDelete}
                              actionDescription={<div>Tag <UiBadge color={tinycolor(modal.data.color)}>{modal.data.name}</UiBadge> will be <u>deleted from all ideas</u> and list of available tags.</div>}/>
        <UiViewBox title={"Tags Management"} description={"Edit your board tags here."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default TagsSubroute;