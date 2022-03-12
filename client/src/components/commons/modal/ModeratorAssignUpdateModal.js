import styled from "@emotion/styled";
import {GenericIcon, IconContainer} from "components/commons/modal/DangerousActionModal";
import {BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamation, FaUserCircle} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiBadge, UiThemeContext} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiDismissibleModal} from "ui/modal";

const AssigneeDetails = styled.div`
  display: inline-block;
  justify-content: center;
  text-align: center;
  margin: .5em;
`;

const AssigneeCandidate = styled(UiAvatar)`
  ${props => props.chosen && `outline: 1px dashed ` + props.theme + `;`}
  padding: .25rem;
`;

const ModeratorAssignUpdateModal = ({isOpen, onHide, onAction}) => {
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData} = useContext(BoardContext);
    const {ideaData} = useContext(IdeaContext);
    const [assignee, setAssignee] = useState(ideaData.assignee);
    /*eslint-disable-next-line*/
    useEffect(() => setAssignee(ideaData.assignee), [onHide]);

    const toggleAssignee = (newAssignee) => {
        if (assignee === newAssignee) {
            setAssignee(null);
            return;
        }
        setAssignee(newAssignee);
    };
    const applyButton = <UiLoadableButton label={"Update"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction(assignee).then(onHide)}>
        <FaExclamation className={"move-top-1px"}/> Update
    </UiLoadableButton>;
    return <UiDismissibleModal id={"assigneeUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"} applyButton={applyButton}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <IconContainer><GenericIcon as={FaUserCircle}/></IconContainer>
                <h3>Are you sure?</h3>
                <div>
                    Choose assignee to add or remove and click Update to confirm.
                    <br/>
                    {boardData.moderators.map((mod, i) => {
                        const chosen = assignee == null ? false : assignee.id === mod.user.id;
                        return <AssigneeDetails key={i} onClick={() => toggleAssignee(mod.user)}>
                            <div className={"mb-1"}>
                                <AssigneeCandidate chosen={chosen} theme={getTheme()} size={48} user={mod.user} roundedCircle/>
                            </div>
                            <UiBadge>{mod.user.username}</UiBadge>
                        </AssigneeDetails>
                    })}
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorAssignUpdateModal;