import axios from "axios";
import {BoardContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaExclamation, FaGithub} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiLabelledCheckbox, UiThemeContext} from "ui";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiFormLabel, UiFormSelect} from "ui/form";
import {UiCol} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {popupError, popupNotification, popupWarning} from "utils/basic-utils";

const GitHubIntegrationModal = ({isOpen, onHide, onUpdate, onDelete, integrations}) => {
    const {getTheme} = useContext(UiThemeContext);
    const {data} = useContext(BoardContext);
    const [tagsToLabels, setTagsToLabels] = useState(false);
    const [advancedTriggers, setAdvancedTriggers] = useState(false);
    const [repoName, setRepoName] = useState("");
    const [validRepos, setValidRepos] = useState([]);
    const integration = integrations.filter(i => i.integrationType === "GITHUB")[0];
    useEffect(() => {
        if (integration === undefined || integration.data === null) {
            return;
        }
        setRepoName(integration.data.repository || "");
        setTagsToLabels(integration.data.tagsToLabels || false);
        setAdvancedTriggers(integration.data.advancedTriggers || false)
        setValidRepos(integration.data.applicable_repositories || []);
        //eslint-disable-next-line
    }, []);

    const handleDisable = () => {
        return axios.delete("/integrations/" + integration.id).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            popupNotification("Integration disabled", getTheme());
            onHide();
            setRepoName("");
            setTagsToLabels(false);
            onDelete(integration);
        });
    };
    const handleUpdate = () => {
        if (!validRepos.includes(repoName)) {
            popupWarning("This repository isn't available.");
            return Promise.resolve();
        }
        return axios.patch("/integrations/" + integration.id, {
            data: JSON.stringify({repository: repoName, tagsToLabels, advancedTriggers})
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            popupNotification("Integration updated", getTheme());
            onHide();
            onUpdate(res.data);
        });
    };

    const getApplyButton = () => {
        if (integration === undefined) {
            return <UiButton label={"Enable"} onClick={() => window.location.href = "https://github.com/apps/feedbacky-github/installations/new?state=" + data.discriminator}
                             className={"mx-0"}>Enable</UiButton>
        }
        return <React.Fragment>
            <UiLoadableButton label={"Disable"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => handleDisable(integration[0])} className={"mx-0 mr-1"}>
                <FaExclamation className={"move-top-1px"}/> Disable
            </UiLoadableButton>
            <UiLoadableButton label={"Update"} onClick={() => handleUpdate(integration[0])} className={"mx-0"}>Update</UiLoadableButton>
        </React.Fragment>
    };
    const onTagsToLabelsChange = () => {
        if (integration === undefined) {
            return;
        }
        setTagsToLabels(!tagsToLabels);
    }
    const onAdvancedTriggersChange = () => {
        if (integration === undefined) {
            return;
        }
        setAdvancedTriggers(!advancedTriggers);
    }
    return <UiDismissibleModal id={"integrationUpdate"} isOpen={isOpen} onHide={onHide} title={"Update GitHub Integration"}
                               applyButton={getApplyButton()}>
        <div className={"mt-2 mb-1"}>
            <div className={"text-center mb-2"}>
                <strong><FaGithub className={"move-top-1px"}/> GitHub</strong> integration allows ideas to be converted into GitHub issues at repository chosen below.
            </div>
            <UiFormLabel>Target Repository</UiFormLabel>
            <UiCol xs={12} className={"d-inline-block px-0"}>
                <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormSelect label={"Choose Repository"} disabled={integration === undefined} defaultValue={repoName}
                                  onChange={e => setRepoName(e.target.value)}>
                        <option>Choose a Repository</option>
                        {validRepos.map(r => <option key={r} value={r}>{r}</option>)}
                    </UiFormSelect>
                </UiCol>
                <UiCol xs={6} className={"my-2 pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormLabel>Tags to Labels</UiFormLabel>
                    <UiClickableTip id={"tagsToLabels"} title={"Tags to Labels"} description={"If selected, all idea tags will be created as labels on GitHub and will be assigned to GitHub issue."}/>
                    <br/>
                    <UiLabelledCheckbox id={"tagsToLabelsCheck"} label={"Convert Tags to GitHub Labels"} checked={tagsToLabels} onChange={onTagsToLabelsChange}/>
                </UiCol>
                <UiCol xs={6} className={"my-2 pr-sm-0 pr-2 px-0 d-inline-block"}>
                    <UiFormLabel>Advanced Triggers</UiFormLabel>
                    <UiClickableTip id={"advancedTriggers"} title={"Advanced Triggers"} description={
                        <React.Fragment>
                            <div>If selected, linked idea will be in sync with GitHub issue for example when idea is closed GitHub issue is closed as well.</div>
                            <strong>List of Triggers to sync</strong>
                            <ul>
                                <li>Comments Sync (Feedbacky Comments to GitHub Comments)</li>
                                <li>State Sync (Comments Restrict/Unrestrict to GitHub Issue Lock/Unlock</li>
                                <li>Status Sync (Idea Close/Open to GitHub Status)</li>
                            </ul>
                        </React.Fragment>
                    }/>
                    <br/>
                    <UiLabelledCheckbox id={"advancedTriggersCheck"} label={"Sync Ideas with Github Issues"} checked={advancedTriggers} onChange={onAdvancedTriggersChange}/>
                </UiCol>
            </UiCol>
        </div>
    </UiDismissibleModal>
};

export default GitHubIntegrationModal;