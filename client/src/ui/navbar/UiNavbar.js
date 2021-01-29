import AppContext from "context/AppContext";
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {Navbar} from "react-bootstrap";

const UiNavbar = ({theme, children}) => {
    const {getTheme} = useContext(AppContext);
    if(theme == null) {
        theme = getTheme();
    }
    return <Navbar variant={"dark"} style={{backgroundColor: theme}} expand={"lg"}>
        {children}
    </Navbar>
};

export default UiNavbar;

UiNavbar.propTypes = {
    theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};