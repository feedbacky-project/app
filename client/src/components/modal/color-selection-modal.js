import React, {useContext, useState} from 'react';
import {Row} from "react-bootstrap";
import PageModal from "components/modal/page-modal";
import ColorSelectionHelper from "components/modal/color-selection-helper";
import AppContext from "context/app-context";
import PageButton from "../app/page-button";

const ColorSelectionModal = ({open, onClose, onUpdate}) => {
    const context = useContext(AppContext);
    const theme = context.getTheme(false);
    const [color, setColor] = useState(theme);
    return <PageModal id="colorSelection" isOpen={open} onHide={onClose} title="Choose New Theme Color" size="sm"
                      applyButton={<PageButton color={theme} onClick={() => onUpdate(color)} className="mx-0">Save</PageButton>}>
        <Row className="mt-3 justify-content-center">
            <div className="mb-2">
                <ColorSelectionHelper title="Theme Color" color={color} setColor={setColor} colorWarning={true}/>
            </div>
        </Row>
    </PageModal>
};

export default ColorSelectionModal;