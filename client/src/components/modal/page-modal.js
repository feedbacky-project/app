import React from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import PropTypes from 'prop-types';

const PageModal = (props) => {
    return <Modal id={props.id} show={props.isOpen} onHide={props.onHide}>
        <Modal.Header className="text-center pb-0" style={{display: "block", borderBottom: "none"}}>
            <Modal.Title><h5 className="modal-title">{props.title}</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-1 px-4">
            {props.children}
        </Modal.Body>
        <Modal.Footer style={{borderTop: "none"}} className="pt-2 pb-3 px-4">
            <Button variant="link" className="m-0 text-black-60" onClick={props.onHide}>
                Cancel
            </Button>
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