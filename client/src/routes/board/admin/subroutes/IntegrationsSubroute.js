import styled from "@emotion/styled";
import GitHubIntegrationModal from "components/board/admin/GitHubIntegrationModal";
import SetupCard, {SetupCardIcon} from "components/board/admin/SetupCard";
import {AppContext, BoardContext, PageNodesContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import {FaGithub} from "react-icons/fa";
import {UiFormLabel} from "ui/form";
import {UiCol} from "ui/grid";
import {UiViewBox} from "ui/viewbox";
import {useTitle} from "utils/use-title";

const IntegrationCard = styled(SetupCard)`
    background-color: var(--tertiary);
`;

const IntegrationsSubroute = () => {
    const {serviceData} = useContext(AppContext);
    const {data: boardData, updateState} = useContext(BoardContext);
    const {setCurrentNode} = useContext(PageNodesContext);
    const [modal, setModal] = useState({open: false, type: ""});
    useEffect(() => setCurrentNode("integrations"), [setCurrentNode]);
    useTitle(boardData.name + " | Integrations");
    const onUpdate = (integration) => {
        const newIntegrations = [...boardData.integrations];
        const index = newIntegrations.findIndex(c => c.id === integration.id);
        newIntegrations[index] = integration;
        updateState({...boardData, integrations: newIntegrations});
    }
    const onDelete = (integration) => {
        const newIntegrations = boardData.integrations.filter(i => i.id !== integration.id);
        updateState({...boardData, integrations: newIntegrations});
    }
    return <UiCol xs={12}>
        <GitHubIntegrationModal onHide={() => setModal({...modal, open: false})} isOpen={modal.open && modal.type === "github"}
                                onUpdate={onUpdate} onDelete={onDelete} integrations={boardData.integrations}/>
        <UiViewBox title={"Integrations"} description={"Integrate Feedbacky with other services here."}>
            <UiCol xs={12} className={"mb-sm-0 mb-3"}>
                <div>
                    <UiFormLabel>Current Integrations</UiFormLabel>
                </div>
                <div>
                    {
                        serviceData.integrationsAvailable.some(i => i === "GITHUB")
                        && <IntegrationCard icon={<SetupCardIcon as={FaGithub}/>} text={"GitHub Integration"} onClick={() => setModal({open: true, type: "github"})}
                                            className={"m-2"} chosen={boardData.integrations.some(i => i.integrationType === "GITHUB")}/>
                    }
                </div>
            </UiCol>
        </UiViewBox>
    </UiCol>
};

export default IntegrationsSubroute;