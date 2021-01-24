import React, {useState} from "react";
import {Form} from "react-bootstrap";

const PageCountableFormControl = ({id, minLength, maxLength, rows = 1, type = "text", placeholder, defaultValue, className, onChange = () => void 0}) => {
    const [currentLength, setCurrentLength] = useState(defaultValue == null ? 0 : defaultValue.length);
    return <React.Fragment>
        <Form.Control className={className} style={{minHeight: 38, resize: "none"}} minLength={minLength} maxLength={maxLength} rows={rows} required type={type}
                      placeholder={placeholder} id={id} defaultValue={defaultValue} onChange={e => {
            e.target.value = e.target.value.substring(0, maxLength);
            setCurrentLength(e.target.value.length);
            onChange(e);
        }}/>
        <Form.Text className="text-right text-black-60" id={"remaining_" + id}>
            {maxLength - currentLength} Remaining
        </Form.Text>
    </React.Fragment>
};

export default PageCountableFormControl;