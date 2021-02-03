import PropTypes from 'prop-types';
import React from 'react';
import Modal from "react-bootstrap/Modal";
import {UiCancelButton} from "ui/button";
import {UiModal} from "ui/modal/UiModal";

const UiDismissibleModal = (props) => {
    const {onHide, title, applyButton, children, ...otherProps} = props;
    return <UiModal header={<Modal.Title><h5 className={"modal-title"}>{title}</h5></Modal.Title>}
                    footer={
                        <React.Fragment>
                            <UiCancelButton className={"m-0"} onClick={onHide}>Cancel</UiCancelButton>
                            {applyButton}
                        </React.Fragment>
                    } onHide={onHide} {...otherProps}>
        {children}
    </UiModal>
};

export {UiDismissibleModal};

UiDismissibleModal.propTypes = {
    id: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    applyButton: PropTypes.element.isRequired,
};