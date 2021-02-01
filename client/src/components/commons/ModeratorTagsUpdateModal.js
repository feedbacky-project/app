import Checkbox from "components/commons/Checkbox";
import {QuestionIcon} from "components/commons/DangerousActionModal";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useState} from "react";
import {FaExclamation} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiBadge, UiModal} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";

const ModeratorTagsUpdateModal = ({isOpen, onHide, onAction}) => {
    const {data: boardData} = useContext(BoardContext);
    const {ideaData} = useContext(IdeaContext);
    const [tags, setTags] = useState(ideaData.tags);

    return <UiModal id={"tagsUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"}
                    applyButton={<UiLoadableButton color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction(tags).then(onHide)}>
                        <FaExclamation className={"move-top-1px"}/> Update
                    </UiLoadableButton>}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>
                    Choose tags to add or remove and click Update to confirm.
                    <div>
                        {boardData.tags.map((data, i) => {
                            const update = () => {
                                let newTags;
                                if (tags.includes(data)) {
                                    newTags = tags.filter(tag => tag.name !== data.name);
                                } else {
                                    newTags = tags.concat(data);
                                }
                                // https://stackoverflow.com/a/39225750/10156191
                                setTimeout(() => setTags(newTags), 0);
                            };
                            return <Checkbox id={"tagManage_" + data.name} key={i} checked={tags.some(d => d.name === data.name)} onChange={update}
                                             label={<UiBadge onClick={update} color={tinycolor(data.color)}>{data.name}</UiBadge>}/>
                        })}
                    </div>
                </div>
            </div>
        </UiRow>
    </UiModal>
};

export default ModeratorTagsUpdateModal;