import {QuestionIcon} from "components/commons/modal/DangerousActionModal";
import React from "react";
import {FaExclamation} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const ModeratorAssignUpdateModal = ({isOpen, onHide, onAction}) => {
    return <UiDismissibleModal id={"assigneeUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"}
                               applyButton={
                                   <React.Fragment>
                                       <UiLoadableButton label={"Update"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction("ALL").then(onHide)}>
                                           <FaExclamation className={"move-top-1px"}/> Reset All
                                       </UiLoadableButton>
                                       <UiLoadableButton label={"Update"} className={"ml-1"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction("ANONYMOUS").then(onHide)}>
                                           <FaExclamation className={"move-top-1px"}/> Reset Anonymous
                                       </UiLoadableButton>
                                   </React.Fragment>
                               }>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>
                    Click <strong>Reset All</strong> to remove every vote or <strong>Reset Anonymous</strong> to remove votes only made by anonymous accounts.
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorAssignUpdateModal;