import ColorSelectionHelper from "components/commons/ColorSelectionHelper";
import AppContext from "context/AppContext";
import React, {useContext, useState} from 'react';
import {UiModal} from "ui";
import {UiButton} from "ui/button";
import {UiRow} from "ui/grid";

const ThemeSelectionModal = ({isOpen, onHide, onUpdate}) => {
    const context = useContext(AppContext);
    const theme = context.getTheme(false);
    const [color, setColor] = useState(theme);
    return <UiModal id={"colorSelection"} isOpen={isOpen} onHide={onHide} title={"Choose New Theme Color"} size={"sm"}
                    applyButton={<UiButton color={theme} onClick={() => onUpdate(color)} className={"mx-0"}>Save</UiButton>}>
        <UiRow centered className={"mt-3"}>
            <div className={"mb-2"}>
                <ColorSelectionHelper title={"Theme Color"} color={color} setColor={setColor} colorWarning={true}/>
            </div>
        </UiRow>
    </UiModal>
};

export default ThemeSelectionModal;