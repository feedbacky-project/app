import React from 'react';
import {OverlayTrigger, Popover} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/all";
import PropTypes from 'prop-types';

const ClickableTip = (props) => {
    return <OverlayTrigger
        trigger="click" placement="top" rootClose={true} rootCloseEvent="click"
        overlay={
            <Popover id={props.id}>
                <Popover.Title as="h3">{props.title}</Popover.Title>
                <Popover.Content>
                    {props.description}
                </Popover.Content>
            </Popover>
        }>
        <FaQuestionCircle className="fa-xs text-black-50 move-top-1px"/>
    </OverlayTrigger>
};

export default ClickableTip;

ClickableTip.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.object.isRequired
};