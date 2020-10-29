import React from 'react';
import {OverlayTrigger, Popover} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/all";
import PropTypes from 'prop-types';

const ClickableTip = ({id, title, description, icon = <FaQuestionCircle className="fa-xs text-black-50 move-top-1px hoverable-option"/>}) => {
    return <OverlayTrigger
        trigger="click" placement="top" rootClose={true} rootCloseEvent="click"
        overlay={
            <Popover id={id}>
                <Popover.Title as="h3">{title}</Popover.Title>
                <Popover.Content>
                    {description}
                </Popover.Content>
            </Popover>
        }>
        {icon}
    </OverlayTrigger>
};

export default ClickableTip;

ClickableTip.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    icon: PropTypes.object
};