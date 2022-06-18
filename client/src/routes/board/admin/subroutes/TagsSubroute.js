import styled from "@emotion/styled";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import axios from "axios";
import TagCreateModal from "components/board/admin/TagCreateModal";
import TagEditModal from "components/board/admin/TagEditModal";
import DangerousActionModal from "components/commons/modal/DangerousActionModal";
import {SvgNotice} from "components/commons/SvgNotice";
import {BoardContext, PageNodesContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import {FaPencilAlt, FaTrash} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiBadge, UiThemeContext} from "ui";
import {UiElementDeleteButton, UiLoadableButton} from "ui/button";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {popupError, popupNotification} from "utils/basic-utils";
import {useTitle} from "utils/use-title";

const Tag = styled.div`
  display: inline-flex;
  justify-content: center;
  margin: .5em;
`;

const TagIcon = styled.div`
  padding: .5rem;
  background-color: hsl(213, 7%, 24%);
  border-radius: var(--border-radius);
  width: 40px;
  height: 40px;
  margin: 0 auto;
  cursor: pointer;
`;

const TagsSubroute = () => {
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData, updateState} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [modal, setModal] = useState({open: false, type: "", data: {id: -1, name: ""}});
    useEffect(() => setCurrentNode("tags"), [setCurrentNode]);
    useTitle(boardData.name + " | Tags");
    const onTagCreate = (data) => {
        updateState({...boardData, tags: boardData.tags.concat(data)});
    };
    const renderContent = () => {
        return <UiCol xs={12}>
            <UiFormLabel>Created Tags</UiFormLabel>
            <div>{renderTags()}</div>
            <UiLoadableButton label={"Add New"} className={"mt-3 float-right"} onClick={() => {
                setModal({open: true, type: "new", data: {id: -1, name: ""}});
                return Promise.resolve();
            }}>Add New</UiLoadableButton>
        </UiCol>
    };
    const renderTags = () => {
        if (boardData.tags.length === 0) {
            return <SvgNotice Component={UndrawNoData} title={"No tags yet."} description={"How about creating one?"}/>
        }
        return boardData.tags.map((tag, i) => {
            const onDelete = () => setModal({open: true, type: "delete", data: {id: tag.id, name: tag.name, color: tinycolor(tag.color)}});
            return <Tag key={tag.id}>
                <div className={"text-center"}>
                    <UiElementDeleteButton tooltipName={"Delete"} id={"tag-" + tag.id + "-del"} offsetX={"12px"} onClick={onDelete}/>
                    <TagIcon onClick={() => onTagEdit(tag)} style={{backgroundColor: tinycolor(tag.color).setAlpha(.1)}}>
                        <FaPencilAlt style={{height: 18, width: 18, color: tag.color}}/>
                    </TagIcon>
                    <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>
                </div>
            </Tag>
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
        return axios.delete("/boards/" + boardData.discriminator + "/tags/" + modal.data.id).then(res => {
            if (res.status !== 204) {
                popupError();
                return;
            }
            updateState({...boardData, tags: boardData.tags.filter(item => item.id !== modal.data.id)});
            popupNotification("Tag deleted", getTheme());
        });
    };
    return <UiCol xs={12}>
        <TagCreateModal isOpen={modal.open && modal.type === "new"} onTagCreate={onTagCreate} onHide={() => setModal({...modal, open: false})}/>
        <TagEditModal isOpen={modal.open && modal.type === "edit"} onHide={() => setModal({...modal, open: false})} tag={modal.data} onEdit={onEdit}/>
        <DangerousActionModal isOpen={modal.open && modal.type === "delete"} id={"tagDel"} onHide={() => setModal({...modal, open: false})} onAction={onTagDelete} Icon={FaTrash}
                              actionDescription={<div>Tag <UiBadge color={tinycolor(modal.data.color)}>{modal.data.name}</UiBadge> will be <u>deleted from all ideas</u> and list of available tags.</div>}/>
        <UiViewBox title={"Tags Management"} description={"Edit your board tags here."}>
            {renderContent()}
        </UiViewBox>
    </UiCol>
};

export default TagsSubroute;