import AppContext from "context/AppContext";
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {Navbar} from "react-bootstrap";

const UiNavbar = (props) => {
    const {getTheme} = useContext(AppContext);
    const {theme = getTheme(), children, ...otherProps} = props;
    return <Navbar variant={"dark"} style={{backgroundColor: theme}} expand={"lg"} {...otherProps}>
        {children}
    </Navbar>
};

export {UiNavbar};

UiNavbar.propTypes = {
    theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};