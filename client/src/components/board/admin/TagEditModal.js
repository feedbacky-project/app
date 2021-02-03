import axios from "axios";
import ColorSelectionHelper from "components/commons/ColorSelectionHelper";
import BoardContext from "context/BoardContext";
import React, {useContext, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import tinycolor from "tinycolor2";
import {UiClickableTip} from "ui";
import {UiLoadableButton} from "ui/button";
import {UiCountableFormControl, UiFormLabel} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";
import {toastError, toastSuccess, toastWarning} from "utils/basic-utils";

//todo merge with TagCreateModal
const TagEditModal = ({tag, isOpen, onHide, onEdit}) => {
    const {data} = useContext(BoardContext);
    const [color, setColor] = useState(tag.color);
    useEffect(() => {
        setColor(tag.color);
    }, [tag]);

    const handleSubmit = () => {
        const name = document.getElementById("tagNameTextarea").value;
        if (name.length < 3 || name.length > 20) {
            toastWarning("Tag name must be between 3 and 20 characters.");
            return Promise.resolve();
        }
        const roadmapIgnored = document.getElementById("roadmapIgnored").checked;
        const publicUse = document.getElementById("publicUse").checked;
        return axios.patch("/boards/" + data.discriminator + "/tags/" + tag.name, {
            name, color, roadmapIgnored, publicUse,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            onHide();
            onEdit(tag, res.data);
            toastSuccess("Tag edited.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    return <UiDismissibleModal id={"tagCreate"} isOpen={isOpen} onHide={onHide} title={"Edit Tag"}
                               applyButton={<UiLoadableButton onClick={handleSubmit} className={"mx-0"}>Save</UiLoadableButton>}>
        <UiRow>
            <UiCol xs={12} className={"mt-2 mb-1"}>
                <UiFormLabel>Tag Name</UiFormLabel>
                <UiClickableTip id={"tagName"} title={"Tag Name"} description={"Descriptive and under 20 characters name of tag."}/>
                <UiCountableFormControl id={"tagNameTextarea"} minLength={2} maxLength={15} placeholder={"Short and descriptive."} defaultValue={tag.name}/>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mb-2"}>
                <ColorSelectionHelper title={"Tag Color"} color={tinycolor(color)} setColor={setColor} colorWarning={true}/>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mb-2"}>
                <div>
                    <UiFormLabel>Ignore Roadmap</UiFormLabel>
                    <UiClickableTip id={"tagColor"} title={"Ignore Roadmap"} description={"Select if you don't want to include show tag and ideas with this tag in roadmap view."}/>
                    <br/>
                    <Form.Check id={"roadmapIgnored"} custom inline label={"Roadmap Ignored"} type={"checkbox"} defaultChecked={tag.roadmapIgnored}/>
                </div>
                <div className={"mt-2"}>
                    <UiFormLabel>Publicly Accessbile</UiFormLabel>
                    <UiClickableTip id={"tagColor"} title={"Ignore Roadmap"} description={"Select if you want this tag to be selectable by users when they create new ideas."}/>
                    <br/>
                    <Form.Check id={"publicUse"} custom inline label={"Public Use"} type={"checkbox"} defaultChecked={tag.publicUse}/>
                </div>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};

export default TagEditModal;