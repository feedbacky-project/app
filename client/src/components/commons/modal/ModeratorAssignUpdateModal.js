import styled from "@emotion/styled";
import {QuestionIcon} from "components/commons/modal/DangerousActionModal";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamation} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiBadge} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiDismissibleModal} from "ui/modal";

const AssigneeDetails = styled.div`
  text-align: center;
`;

const AssigneeCandidate = styled(UiAvatar)`
  ${props => props.chosen ? `border: 2px solid ` + props.theme : `border: 2px solid transparent`}
`;

const ModeratorAssignUpdateModal = ({isOpen, onHide, onAction}) => {
    const {getTheme} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const {ideaData} = useContext(IdeaContext);
    const [assignee, setAssignee] = useState(ideaData.assignee);
    /*eslint-disable-next-line*/
    useEffect(() => setAssignee(ideaData.assignee), [onHide]);

    const toggleAssignee = (newAssignee) => {
        if(assignee === newAssignee) {
            setAssignee(null);
            return;
        }
        setAssignee(newAssignee);
    };
    return <UiDismissibleModal id={"assigneeUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"}
                               applyButton={<UiLoadableButton label={"Update"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction(assignee).then(onHide)}>
                                   <FaExclamation className={"move-top-1px"}/> Update
                               </UiLoadableButton>}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>
                    Choose assignee to add or remove and click Update to confirm.
                    {boardData.moderators.map((mod, i) => {
                        const chosen = assignee == null ? false : assignee.id === mod.user.id;
                        return <div key={i} className={"d-inline-flex justify-content-center mr-2 mt-1"}>
                            <AssigneeDetails onClick={() => toggleAssignee(mod.user)}>
                                <div className={"mb-1"}>
                                    <AssigneeCandidate chosen={chosen} theme={getTheme()} size={64} user={mod.user} roundedCircle/>
                                </div>
                                <UiBadge>{mod.user.username}</UiBadge>
                            </AssigneeDetails>
                        </div>
                    })}
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorAssignUpdateModal;