import React from 'react';
import {Navbar} from "react-bootstrap";
import PropTypes from 'prop-types';

const PageNavbar = (props) => {
    return <Navbar variant="dark" style={{backgroundColor: props.theme}} expand="lg">
        {props.children}
    </Navbar>
};

export default PageNavbar;

PageNavbar.propTypes = {
    theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};