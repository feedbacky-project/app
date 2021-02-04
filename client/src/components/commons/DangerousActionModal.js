import styled from "@emotion/styled";
import React from "react";
import {FaExclamation, FaQuestion} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiLoadableButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

export const QuestionIcon = styled(FaQuestion)`
  color: hsl(2, 95%, 66%);
  background-color: hsla(2, 95%, 66%, .1);
  height: 5rem;
  width: 5rem;
  padding: 1.5rem;
  border-radius: 50%;
  margin-bottom: 1rem;
  margin-left: auto;
  margin-right: auto;
`;

const DangerousActionModal = ({id, isOpen, onHide, onAction, actionButtonName = "Delete", actionDescription, size = "sm"}) => {
    return <UiDismissibleModal id={id} isOpen={isOpen} onHide={onHide} title={""} size={size} className={"mx-0"}
                               applyButton={<UiLoadableButton label={actionButtonName} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction().then(onHide)}>
                                   <FaExclamation className={"move-top-1px"}/> {actionButtonName}
                               </UiLoadableButton>}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>{actionDescription}</div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default DangerousActionModal;