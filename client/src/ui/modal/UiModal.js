import React from "react";
import Modal from "react-bootstrap/Modal";

const UiModal = (props) => {
    const {id, isOpen, onHide, header, footer = null, children, size, ...otherProps} = props;
    return <Modal size={size} id={id} show={isOpen} onHide={onHide} centered {...otherProps}>
        <Modal.Header>
            {header}
        </Modal.Header>
        <Modal.Body>
            {children}
        </Modal.Body>
        <Modal.Footer>
            {footer}
        </Modal.Footer>
    </Modal>
};

export {UiModal};