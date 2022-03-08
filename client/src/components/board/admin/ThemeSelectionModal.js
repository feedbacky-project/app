import ColorSelectionHelper from "components/commons/ColorSelectionHelper";
import React, {useContext, useState} from 'react';
import {UiThemeContext} from "ui";
import {UiButton} from "ui/button";
import {UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const ThemeSelectionModal = ({isOpen, onHide, onUpdate}) => {
    const {getTheme} = useContext(UiThemeContext);
    const [color, setColor] = useState(getTheme(false));

    const applyButton = <UiButton label={"Save"} color={getTheme(false)} onClick={() => onUpdate(color)} className={"mx-0"}>Save</UiButton>;
    return <UiDismissibleModal id={"colorSelection"} isOpen={isOpen} onHide={onHide} title={"Choose New Theme Color"} small applyButton={applyButton}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2"}>
                <ColorSelectionHelper title={"Theme Color"} color={color} setColor={setColor} colorWarning={true}/>
            </div>
        </UiRow>
    </UiDismissibleModal>
};

export default ThemeSelectionModal;