import React from 'react';
import Modal from "react-bootstrap/Modal";
import PropTypes from 'prop-types';
import PageCancelButton from "../app/page-cancel-button";

const PageModal = ({id, isOpen, onHide, title, applyButton, children, size}) => {
    return <Modal size={size} id={id} show={isOpen} onHide={onHide} centered>
        <Modal.Header>
            <Modal.Title><h5 className="modal-title">{title}</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {children}
        </Modal.Body>
        <Modal.Footer>
            <PageCancelButton className="m-0" onClick={onHide}>
            Cancel
            </PageCancelButton>
            {applyButton}
        </Modal.Footer>
    </Modal>
};

PageModal.propTypes = {
    id: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    applyButton: PropTypes.element.isRequired,
};

export default PageModal;