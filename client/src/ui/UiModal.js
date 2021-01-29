import PropTypes from 'prop-types';
import React from 'react';
import Modal from "react-bootstrap/Modal";
import UiCancelButton from "ui//button/UiCancelButton";

const UiModal = ({id, isOpen, onHide, title, applyButton, children, size}) => {
    return <Modal size={size} id={id} show={isOpen} onHide={onHide} centered>
        <Modal.Header>
            <Modal.Title><h5 className={"modal-title"}>{title}</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {children}
        </Modal.Body>
        <Modal.Footer>
            <UiCancelButton className={"m-0"} onClick={onHide}>Cancel</UiCancelButton>
            {applyButton}
        </Modal.Footer>
    </Modal>
};

UiModal.propTypes = {
    id: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    applyButton: PropTypes.element.isRequired,
};

export default UiModal;