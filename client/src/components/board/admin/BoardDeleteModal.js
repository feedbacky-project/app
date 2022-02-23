import {QuestionIcon} from "components/commons/modal/DangerousActionModal";
import React, {useRef, useState} from "react";
import {FaExclamation} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiKeyboardInput, UiLabelledCheckbox} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {popupWarning} from "utils/basic-utils";

const BoardDeleteModal = ({id, isOpen, onHide, onAction, boardData, ...otherProps}) => {
    const [text, setText] = useState("");
    const [ideaAgree, setIdeaAgree] = useState(false);
    const [moderatorsAgree, setModeratorsAgree] = useState(false);
    const [deleteAgree, setDeleteAgree] = useState(false);
    const ref = useRef();

    return <UiDismissibleModal id={"boardDelete"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"}
                               applyButton={<UiLoadableButton label={"Delete Now"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => {
                                   if (!ideaAgree || !moderatorsAgree || !deleteAgree) {
                                       popupWarning("Select all agreements first")
                                       return Promise.resolve();
                                   }
                                   if (text !== boardData.name) {
                                       popupWarning("Type valid board name");
                                       return Promise.resolve();
                                   }
                                   return onAction().then(onHide);
                               }}><FaExclamation className={"move-top-1px"}/> Delete Now</UiLoadableButton>}
                               onEntered={() => ref.current && ref.current.focus()} {...otherProps}>
        <UiRow centered className={"mt-3 justify-content-center"}>
            <UiCol xs={12} className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>
                    Hold on, <strong>this is one-way road.</strong> Your board and all the data <strong>will be permanently deleted.</strong> Are you really sure?
                    <div className={"mb-2"}>By deleting the board you agree that:</div>
                    <div><UiLabelledCheckbox checked={ideaAgree} onChange={e => setIdeaAgree(e.target.checked)} id={"ideaAgree"}>I understand that <strong className={"text-red"}>{boardData.allIdeas} ideas</strong> will be deleted forever</UiLabelledCheckbox></div>
                    <div><UiLabelledCheckbox className={"mr-sm-2"} checked={moderatorsAgree} onChange={e => setModeratorsAgree(e.target.checked)} id={"moderatorsAgree"}>I understand that <strong className={"text-red"}>{boardData.moderators.length} moderators</strong> will be removed</UiLabelledCheckbox></div>
                    <div><UiLabelledCheckbox className={"ml-sm-3"} checked={deleteAgree} onChange={e => setDeleteAgree(e.target.checked)} id={"deleteAgree"}>I understand that deleted data won't be recoverable</UiLabelledCheckbox></div>
                    <div className={"mt-2"}>Type <UiKeyboardInput>{boardData.name}</UiKeyboardInput> to continue.</div>
                </div>
            </UiCol>
            <UiCol xs={12} sm={10}>
                <UiFormControl innerRef={ref} id={"confirm"} label={"Confirm Action"} className={"mt-2"} onChange={e => setText(e.target.value)} placeholder={boardData.name}/>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};

export default BoardDeleteModal;