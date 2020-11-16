import {Button, Spinner} from "react-bootstrap";
import React, {useState} from "react";

const ExecutableButton = ({children, variant, onClick, size, style = null, className = null}) => {
    const [loading, setLoading] = useState(false);
    return <Button variant={variant} size={size} className={className || "m-0 mt-sm-0 mt-2"} style={style} disabled={loading} onClick={() => {
        setLoading(true);
        onClick().finally(() => setLoading(false));
    }}>{loading ? <React.Fragment><Spinner animation="grow" size="sm"/> <span className="align-middle">{children}</span></React.Fragment> : children}</Button>
};

export default ExecutableButton;