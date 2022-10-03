import {GenericIcon, IconContainer} from "components/commons/modal/DangerousActionModal";
import React, {useState} from "react";
import {FaExclamation, FaPoll} from "react-icons/fa";
import tinycolor from "tinycolor2";
import {UiLoadableButton} from "ui/button";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const ModeratorAssignUpdateModal = ({isOpen, onHide, onAction}) => {
    const [resetType, setResetType] = useState("all");
    const resetTypes = [
        {all: {name: "All"}},
        {anonymous: {name: "Anonymous"}}
    ];
    const resetValues = resetTypes.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => setResetType(key)}>{value.name}</UiDropdownElement>
    });
    const resetCurrentValue = Object.values(resetTypes.find(obj => {
        return Object.keys(obj)[0] === (resetType || "all")
    }) || resetTypes[0])[0].name;
    const applyButton = <UiLoadableButton label={"Update"} className={"ml-1"} color={tinycolor("hsl(2, 95%, 66%)")} onClick={() => onAction(resetType.toUpperCase()).then(onHide)}>
            <FaExclamation className={"move-top-1px"}/> Apply
        </UiLoadableButton>;
    return <UiDismissibleModal id={"assigneeUpdate"} isOpen={isOpen} onHide={onHide} title={""} size={"md"} className={"mx-0"} applyButton={applyButton}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2 px-4 text-center"}>
                <IconContainer><GenericIcon as={FaPoll}/></IconContainer>
                <h3>Are you sure?</h3>
                <div>
                    Choose <strong>All</strong> to remove every vote or <strong>Anonymous</strong> to remove votes only made by anonymous accounts.
                    <UiCol xs={12} className={"pt-2 d-inline-block"} style={{zIndex: 20}}>
                        <UiSelectableDropdown label={"Choose Reset"} id={"reset"} toggleClassName={"w-50"} className={"d-inline"} currentValue={resetCurrentValue} values={resetValues}
                                              toggleStyle={{minHeight: "36px"}}/>
                    </UiCol>
                </div>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ModeratorAssignUpdateModal;