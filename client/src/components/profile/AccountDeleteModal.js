import {QuestionIcon} from "components/commons/modal/DangerousActionModal";
import React, {useState} from "react";
import {FaExclamation} from "react-icons/all";
import tinycolor from "tinycolor2";
import {UiKeyboardInput, UiLabelledCheckbox} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiFormControl} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {hideMail, popupWarning} from "utils/basic-utils";

const AccountDeleteModal = ({id, isOpen, onHide, onAction, user, ...otherProps}) => {
    const [text, setText] = useState("");
    const [anonymousAgree, setAnonymousAgree] = useState(false);
    const [moderatorsAgree, setModeratorsAgree] = useState(false);
    const [deleteAgree, setDeleteAgree] = useState(false);
    return <UiDismissibleModal id={"accountDel"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"}
                               applyButton={<UiLoadableButton label={"Deactivate"} className={"mx-0"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => {
                                   if (!anonymousAgree || !moderatorsAgree || !deleteAgree) {
                                       popupWarning("Select all agreements first")
                                       return Promise.resolve();
                                   }
                                   if (text !== user.data.email) {
                                       popupWarning("Type your email properly");
                                       return Promise.resolve();
                                   }
                                   return onAction().then(onHide);
                               }}><FaExclamation className={"move-top-1px"}/> Deactivate</UiLoadableButton>} {...otherProps}>
        <UiRow centered className={"mt-3 justify-content-center"}>
            <UiCol xs={12} className={"mb-2 px-4 text-center"}>
                <QuestionIcon/>
                <h3>Are you sure?</h3>
                <div>
                    Hold on, <strong>this is one-way road.</strong> Your account will be <strong>fully anonymized</strong> but your content on the page will be kept.
                    <div>You won't be able to log-in to this account anymore.</div>
                    <div className={"mb-2"}>By deleting the account you agree that:</div>
                    <div><UiLabelledCheckbox checked={anonymousAgree} onChange={e => setAnonymousAgree(e.target.checked)} id={"ideaAgree"}>I understand that my account will <strong className={"text-red"}>be anonymized</strong></UiLabelledCheckbox></div>
                    <div><UiLabelledCheckbox className={"mr-sm-3"} checked={moderatorsAgree} onChange={e => setModeratorsAgree(e.target.checked)} id={"moderatorsAgree"}>I understand that I'll leave <strong className={"text-red"}>{user.data.permissions.length} boards</strong> I moderate</UiLabelledCheckbox></div>
                    <div><UiLabelledCheckbox className={"mr-sm-2"} checked={deleteAgree} onChange={e => setDeleteAgree(e.target.checked)} id={"deleteAgree"}>I understand that my account is not recoverable</UiLabelledCheckbox></div>
                    <div className={"mt-2"}>Type uncensored <UiKeyboardInput>{hideMail(user.data.email)}</UiKeyboardInput> to continue.</div>
                </div>
            </UiCol>
            <UiCol xs={12} sm={10}>
                <UiFormControl id={"confirm"} label={"Confirm Action"} className={"mt-2"} onChange={e => setText(e.target.value)}/>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};

export default AccountDeleteModal;