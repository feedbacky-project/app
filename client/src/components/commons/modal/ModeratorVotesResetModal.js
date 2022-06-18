import {GenericIcon, IconContainer} from "components/commons/modal/DangerousActionModal";
import React from "react";
import {FaExclamation, FaPoll} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const ModeratorAssignUpdateModal = ({isOpen, onHide, onAction}) => {
    const applyButton = <React.Fragment>
        <UiLoadableButton label={"Update"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction("ALL").then(onHide)}>
            <FaExclamation className={"move-top-1px"}/> Reset All
        </UiLoadableButton>
        <UiLoadableButton label={"Update"} className={"ml-1"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction("ANONYMOUS").then(onHide)}>
            <FaExclamation className={"move-top-1px"}/> Reset Anonymous
        </UiLoadableButton>
    </React.Fragment>;
    return <UiDismissibleModal id={"assigneeUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"} applyButton={applyButton}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <IconContainer><GenericIcon as={FaPoll}/></IconContainer>
                <h3>Are you sure?</h3>
                <div>
                    Click <strong>Reset All</strong> to remove every vote or <strong>Reset Anonymous</strong> to remove votes only made by anonymous accounts.
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorAssignUpdateModal;