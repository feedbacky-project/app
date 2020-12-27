import React, {useContext, useState} from 'react';
import {Row} from "react-bootstrap";
import PageModal from "components/modal/page-modal";
import Button from "react-bootstrap/Button";
import ColorSelectionHelper from "components/modal/color-selection-helper";
import AppContext from "context/app-context";

const ColorSelectionModal = ({open, onClose, onUpdate}) => {
    const context = useContext(AppContext);
    const theme = context.getTheme();
    const [color, setColor] = useState(theme);
    return <PageModal id="colorSelection" isOpen={open} onHide={onClose} title="Choose New Theme Color" size="sm"
                      applyButton={<Button variant="" type="submit" style={{backgroundColor: theme}} onClick={() => onUpdate(color)} className="mx-0">Save</Button>}>
        <Row className="mt-3 justify-content-center">
            <div className="mb-2">
                <ColorSelectionHelper title="Theme Color" color={color} setColor={setColor} colorWarning={true}/>
            </div>
        </Row>
    </PageModal>
};

export default ColorSelectionModal;