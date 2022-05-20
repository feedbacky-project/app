import {GenericIcon, IconContainer} from "components/commons/modal/DangerousActionModal";
import {BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamation, FaTags} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiBadge} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormSelect} from "ui/form";
import {UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const ModeratorTagsUpdateModal = ({isOpen, onHide, onAction}) => {
    const {data: boardData} = useContext(BoardContext);
    const {ideaData} = useContext(IdeaContext);
    const [tags, setTags] = useState(ideaData.tags);
    const allTags = boardData.tags;
    /*eslint-disable-next-line*/
    useEffect(() => setTags(ideaData.tags), [onHide]);

    const applyButton = <UiLoadableButton label={"Update"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction(tags).then(onHide)}>
        <FaExclamation className={"move-top-1px"}/> Update
    </UiLoadableButton>;
    const onTagChange = changed => {
        setTags(changed.map(option => allTags.find(t => t.id === option.value)));
    }
    return <UiDismissibleModal id={"tagsUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"} applyButton={applyButton}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <IconContainer><GenericIcon as={FaTags}/></IconContainer>
                <h3>Are you sure?</h3>
                <div className={"text-left"}>
                    <div className={"mb-2 text-center"}>Choose tags to add or remove and click Update to confirm.</div>
                    <UiFormSelect name={"tagSelector"} value={tags.map(tag => ({value: tag.id, label: <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}))} isMulti options={allTags.map(tag => ({value: tag.id, label: <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}))}
                                  onChange={onTagChange} placeholder={"Choose Tags"}
                                  filterOption={(candidate, input) => {
                                      return candidate.data.__isNew__ || allTags.find(t => t.id === candidate.value).name.toLowerCase().includes(input.toLowerCase());
                                  }}/>
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorTagsUpdateModal;