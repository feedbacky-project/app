import React, {useRef, useState} from "react";
import tinycolor from "tinycolor2";
import {UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const TextInputActionModal = ({id, isOpen, onHide, onAction, actionButtonName = "Confirm", actionDescription, ...otherProps}) => {
    const [text, setText] = useState("");
    const ref = useRef();

    const applyButton = <UiLoadableButton label={actionButtonName} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => {
        return onAction(text).then(onHide);
    }}>{actionButtonName}</UiLoadableButton>;
    return <UiDismissibleModal id={id} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"} applyButton={applyButton}
                               onEntered={() => ref.current && ref.current.focus()} {...otherProps}>
        <UiRow centered className={"mt-3 justify-content-center"}>
            <UiCol xs={12} className={"mb-2 px-4 text-center"}>
                <div>{actionDescription}</div>
            </UiCol>
            <UiCol xs={12} sm={10}>
                <UiFormControl innerRef={ref} id={"confirm"} label={"Confirm Action"} className={"mt-2"} onChange={e => setText(e.target.value)}/>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};

export default TextInputActionModal;