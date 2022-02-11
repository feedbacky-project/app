import PropTypes from "prop-types";
import React, {useState} from "react";
import {UiFormText} from "ui/form/index";
import {UiFormControl} from "ui/form/UiFormControl";

const UiCountableFormControl = (props) => {
    const {minLength, maxLength, defaultValue, onChange = () => void 0, ...otherProps} = props;
    const [currentLength, setCurrentLength] = useState(defaultValue == null ? 0 : defaultValue.length);
    return <React.Fragment>
        <UiFormControl onChange={e => {
            e.target.value = e.target.value.substring(0, maxLength);
            setCurrentLength(e.target.value.length);
            onChange(e);
        }} defaultValue={defaultValue} minLength={minLength} maxLength={maxLength} {...otherProps}/>
        <UiFormText className={"text-right"}>
            {maxLength - currentLength} Remaining
        </UiFormText>
    </React.Fragment>
};

UiCountableFormControl.propTypes = {
    label: PropTypes.string.isRequired,
    minLength: PropTypes.number.isRequired,
    maxLength: PropTypes.number.isRequired,
    defaultValue: PropTypes.string.isRequired,
};

export {UiCountableFormControl};