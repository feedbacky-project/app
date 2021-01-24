import React, {useContext} from "react";
import AppContext from "../../context/app-context";
import tinycolor from "tinycolor2";
import {Button} from "react-bootstrap";

const PageButton = ({children, color, className, style, disabled, onClick, size, as, to}) => {
    const appContext = useContext(AppContext);
    if (appContext.user.darkMode) {
        color = color.lighten(10);
        //if still not readable, increase again
        if (tinycolor.readability(color, "#282828") < 2.5) {
            color = color.lighten(35);
        }
        return <Button as={as} to={to} variant="" size={size} style={{color: color, fontWeight: "bold", backgroundColor: color.clone().setAlpha(.1), style}}
                       disabled={disabled} className={className} onClick={onClick}>{children}</Button>
    }
    return <Button as={as} to={to}  variant="" size={size} style={{backgroundColor: color, style}} disabled={disabled} className={className} onClick={onClick}>{children}</Button>
};

export default PageButton;