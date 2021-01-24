import React from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import PropTypes from 'prop-types';
import PageCancelButton from "../app/page-cancel-button";

const PageModal = (props) => {
    return <Modal size={props.size} id={props.id} show={props.isOpen} onHide={props.onHide} centered>
        <Modal.Header>
            <Modal.Title><h5 className="modal-title">{props.title}</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {props.children}
        </Modal.Body>
        <Modal.Footer>
            <PageCancelButton className="m-0" onClick={props.onHide}>
                Cancel
            </PageCancelButton>
            {props.applyButton}
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