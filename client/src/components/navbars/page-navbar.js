import React from 'react';
import {Navbar} from "react-bootstrap";
import PropTypes from 'prop-types';

const PageNavbar = (props) => {
    return <Navbar variant="dark" style={{zIndex: 3, backgroundColor: props.theme}} expand="lg" className="py-1">
        {props.children}
    </Navbar>
};

export default PageNavbar;

PageNavbar.propTypes = {
    theme: PropTypes.string.isRequired
};