import {QuestionIcon} from "components/commons/DangerousActionModal";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useState} from "react";
import {FaExclamation} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiBadge, UiLabelledCheckbox} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const ModeratorTagsUpdateModal = ({isOpen, onHide, onAction}) => {
    const {data: boardData} = useContext(BoardContext);
    const {ideaData} = useContext(IdeaContext);
    const [tags, setTags] = useState(ideaData.tags);
    const allTags = boardData.tags;

    return <UiDismissibleModal id={"tagsUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"}
                               applyButton={<UiLoadableButton label={"Update"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction(tags).then(onHide)}>
                                   <FaExclamation className={"move-top-1px"}/> Update
                               </UiLoadableButton>}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>
                    Choose tags to add or remove and click Update to confirm.
                    <div>
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
                            return <div key={i} onClick={update} className={"d-inline"}>
                                <UiLabelledCheckbox id={"applicableTag_" + tag.id} key={i} checked={tags.some(t => t.name === tag.name)} onChange={update} className={"mr-3"}
                                                    label={<UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}/>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorTagsUpdateModal;