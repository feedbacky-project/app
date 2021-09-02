import styled from "@emotion/styled";
import {IdeaContext} from "context";
import React, {useContext} from "react";
import {UiClickableTip, UiPrettyUsername} from "ui";
import {UiAvatar} from "ui/image";

const Assignee = styled(UiAvatar)`
  border: 2px solid var(--secondary);
`;

const AssigneeUsername = styled.small`
  margin-left: .25rem;
  vertical-align: middle;
  font-weight: bold;
`;

const AssigneeInfo = () => {
    const {ideaData} = useContext(IdeaContext);
    if (ideaData.assignee == null) {
        return <React.Fragment/>
    }
    return <React.Fragment>
        <div className={"my-1 text-black-75"}>
            Assigned User
        </div>
        <Assignee roundedCircle user={ideaData.assignee} size={25}/>
        <AssigneeUsername><UiPrettyUsername user={ideaData.assignee}/></AssigneeUsername>
    </React.Fragment>
};

export default AssigneeInfo;