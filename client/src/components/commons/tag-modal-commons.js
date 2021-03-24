import ColorSelectionHelper from "components/commons/ColorSelectionHelper";
import React from "react";
import tinycolor from "tinycolor2";
import {UiClickableTip, UiLabelledCheckbox} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiCountableFormControl, UiFormLabel} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

export const renderModal = (isOpen, onHide, title, handleSubmit, color, setColor, tagData = {name: "", roadmapIgnored: false, publicUse: false}, setTagData) => {
    return <UiDismissibleModal id={"tagCreate"} isOpen={isOpen} onHide={onHide} title={title}
                               applyButton={<UiLoadableButton label={"Save"} onClick={handleSubmit} className={"mx-0"}>Save</UiLoadableButton>}>
        <UiRow>
            <UiCol xs={12} className={"mt-2 mb-1"}>
                <UiFormLabel>Tag Name</UiFormLabel>
                <UiClickableTip id={"tagName"} title={"Tag Name"} description={"Descriptive and under 20 characters name of tag."}/>
                <UiCountableFormControl label={"Type tag name"} id={"tagNameTextarea"} minLength={2} maxLength={15} placeholder={"Short and descriptive."}
                                        defaultValue={tagData.name} onChange={e => setTagData({...tagData, name: e.target.value})}/>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mb-2"}>
                <ColorSelectionHelper title={"Tag Color"} color={tinycolor(color)} setColor={setColor} colorWarning={true}/>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mb-2"}>
                <div>
                    <UiFormLabel>Ignore Roadmap</UiFormLabel>
                    <UiClickableTip id={"tagColor"} title={"Ignore Roadmap"} description={"Select if you don't want to include show tag and ideas with this tag in roadmap view."}/>
                    <br/>
                    <UiLabelledCheckbox id={"roadmapIgnored"} label={"Roadmap Ignored"} checked={tagData.roadmapIgnored} onChange={() => setTagData({...tagData, roadmapIgnored: !tagData.roadmapIgnored})}/>
                </div>
                <div className={"mt-2"}>
                    <UiFormLabel>Publicly Accessible</UiFormLabel>
                    <UiClickableTip id={"tagColor"} title={"Ignore Roadmap"} description={"Select if you want this tag to be selectable by users when they create new ideas."}/>
                    <br/>
                    <UiLabelledCheckbox id={"publicUse"} label={"Public Use"} checked={tagData.publicUse} onChange={() => setTagData({...tagData, publicUse: !tagData.publicUse})}/>
                </div>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};