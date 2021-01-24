import React, {useState} from "react";
import LoadingSpinner from "../util/loading-spinner";
import PageButton from "./page-button";

const ExecutableButton = ({children, color, onClick, size, style = null, className = null}) => {
    const [loading, setLoading] = useState(false);
    return <PageButton color={color} size={size} className={className || "m-0 mt-sm-0 mt-2"} style={style} disabled={loading} onClick={() => {
        setLoading(true);
        onClick().finally(() => setLoading(false));
    }}>{loading ? <React.Fragment><LoadingSpinner size="sm" color="#f2f2f2" className="mr-1"/> <span className="align-middle">{children}</span></React.Fragment> : children}</PageButton>
};

export default ExecutableButton;