import styled from "@emotion/styled";
import React from "react";
import {FaExclamation, FaQuestion} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiModal} from "ui";
import {UiButton} from "ui/button";
import {UiRow} from "ui/grid";

const QuestionIcon = styled(FaQuestion)`
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

const DangerousActionModal = ({id, isOpen, onHide, onAction, actionButtonName = "Delete", actionDescription}) => {
    return <UiModal id={id} isOpen={isOpen} onHide={onHide} title={""} size={"sm"} className={"mx-0"}
                    applyButton={<UiButton color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => {
                        onHide();
                        onAction();
                    }}><FaExclamation className={"move-top-1px"}/> {actionButtonName}</UiButton>}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>{actionDescription}</div>
            </div>
        </UiRow>
    </UiModal>
};

export default DangerousActionModal;