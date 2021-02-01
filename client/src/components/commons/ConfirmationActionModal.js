import {QuestionIcon} from "components/commons/DangerousActionModal";
import React, {useState} from "react";
import {Form} from "react-bootstrap";
import {FaExclamation} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiModal} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiCol, UiRow} from "ui/grid";
import {toastWarning} from "utils/basic-utils";

const ConfirmationActionModal = ({id, isOpen, onHide, onAction, actionButtonName = "Delete", actionDescription, confirmText, confirmFailMessage}) => {
    const [text, setText] = useState("");
    return <UiModal id={id} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"}
                    applyButton={<UiLoadableButton color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => {
                        if (text !== confirmText) {
                            toastWarning(confirmFailMessage);
                            return Promise.resolve();
                        }
                        return onAction().then(onHide);
                    }}><FaExclamation className={"move-top-1px"}/> {actionButtonName}</UiLoadableButton>}>
        <UiRow centered className={"mt-3 justify-content-center"}>
            <UiCol xs={12} className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>{actionDescription}</div>
            </UiCol>
            <UiCol xs={12} sm={10}>
                <Form.Control className={"mt-2"} style={{minHeight: 38, resize: "none"}} required onChange={e => setText(e.target.value)}/>
            </UiCol>
        </UiRow>
    </UiModal>
};

export default ConfirmationActionModal;