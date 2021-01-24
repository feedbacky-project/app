import React, {useContext} from 'react';
import {Navbar} from "react-bootstrap";
import PropTypes from 'prop-types';
import AppContext from "../../context/app-context";

const PageNavbar = ({theme, children}) => {
    const context = useContext(AppContext);
    if(theme == null) {
        theme = context.getTheme();
    }
    return <Navbar variant="dark" style={{backgroundColor: theme}} expand="lg">
        {children}
    </Navbar>
};

export default PageNavbar;

PageNavbar.propTypes = {
    theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};