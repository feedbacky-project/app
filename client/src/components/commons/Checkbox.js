import React from "react";

//todo pretty check box, not react-bootstrap based because it doesn't work
const Checkbox = ({id, checked, onChange, label}) => {
    return <div className={"mx-2 d-inline-block"}>
        <input
            id={id}
            className={"mr-2 align-middle move-top-1px"}
            type="checkbox"
            checked={checked}
            onChange={onChange}
        />
        <label htmlFor={id}>{label}</label>
    </div>
};

export default Checkbox;