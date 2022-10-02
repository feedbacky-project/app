import styled from "@emotion/styled";
import {IdeaContext} from "context";
import React, {useContext} from "react";
import {UiPrettyUsername} from "ui";
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

    if (ideaData.assignees.length === 0) {
        return <React.Fragment/>
    }
    return <React.Fragment>
        <div className={"mt-1 text-black-75"}>
            Assignees
        </div>
        {ideaData.assignees.map(a => {
            return <div key={a.id} className={"my-1"}>
                <Assignee roundedCircle user={a} size={25}/>
                <AssigneeUsername><UiPrettyUsername user={a}/></AssigneeUsername>
            </div>
        })}
    </React.Fragment>
};

export default AssigneeInfo;