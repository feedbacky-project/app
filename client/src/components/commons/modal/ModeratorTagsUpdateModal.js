import styled from "@emotion/styled";
import {GenericIcon, IconContainer} from "components/commons/modal/DangerousActionModal";
import {BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamation} from "react-icons/all";
import {FaTags} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiBadge, UiLabelledCheckbox} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const TagsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: stretch;
  text-align: left;
  margin-top: .25rem;
`;

const SelectableTag = styled.div`
  width: 130px;
  flex-grow: 1;
  display: inline-block;
  margin-right: .5rem;
  cursor: pointer;
`;

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
    return <UiDismissibleModal id={"tagsUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"} applyButton={applyButton}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <IconContainer><GenericIcon as={FaTags}/></IconContainer>
                <h3>Are you sure?</h3>
                <div>
                    Choose tags to add or remove and click Update to confirm.
                    <TagsContainer>
                        {allTags.map((tag, i) => {
                            const update = () => {
                                let newTags;
                                if (tags.some(t => t.name === tag.name)) {
                                    newTags = tags.filter(t => t.name !== tag.name);
                                } else {
                                    newTags = tags.concat(tag);
                                }
                                // https://stackoverflow.com/a/39225750/10156191
                                setTimeout(() => setTags(newTags), 10);
                            };
                            //FIXME odd workaround for not working checkbox
                            return <SelectableTag key={i} onClick={update} className={"d-inline-block"}>
                                <UiLabelledCheckbox id={"applicableTag_" + tag.id} key={i} checked={tags.some(t => t.name === tag.name)} onChange={update}
                                                    label={<UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}/>
                            </SelectableTag>
                        })}
                        {/* for uneven amount of tags add a dummy div(s) for even flex stretch*/}
                        {allTags.length % 3 === 1 || <SelectableTag/>}
                        {allTags.length % 3 === 2 || <SelectableTag/>}
                    </TagsContainer>
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorTagsUpdateModal;