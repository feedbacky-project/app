import React, {useState} from "react";
import {Form} from "react-bootstrap";

const UiCountableFormControl = (props) => {
    const {minLength, maxLength, defaultValue, onChange = () => void 0, ...otherProps} = props;
    const [currentLength, setCurrentLength] = useState(defaultValue == null ? 0 : defaultValue.length);
    return <React.Fragment>
        <Form.Control style={{minHeight: 38, resize: "none"}} required onChange={e => {
            e.target.value = e.target.value.substring(0, maxLength);
            setCurrentLength(e.target.value.length);
            onChange(e);
        }} defaultValue={defaultValue} minLength={minLength} maxLength={maxLength} {...otherProps}/>
        <Form.Text className={"text-right text-black-60"}>
            {maxLength - currentLength} Remaining
        </Form.Text>
    </React.Fragment>
};

export {UiCountableFormControl};