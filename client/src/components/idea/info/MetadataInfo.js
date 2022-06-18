import SafeAnchor from "components/commons/SafeAnchor";
import {IdeaContext} from "context";
import React, {useContext} from "react";
import {FaGithub} from "react-icons/fa";
import {UiButton} from "ui/button";

const MetadataInfo = () => {
    const {ideaData} = useContext(IdeaContext);
    return <React.Fragment>
        {
            ideaData.metadata.integration_github_url &&
            <React.Fragment>
                <div className={"my-1 text-black-75"}>
                    GitHub Issue
                </div>
                <SafeAnchor url={ideaData.metadata.integration_github_url}>
                    <UiButton label={"See Issue"} small><FaGithub className={"move-top-1px"}/> See Issue</UiButton>
                </SafeAnchor>
            </React.Fragment>
        }
    </React.Fragment>
};

export default MetadataInfo;