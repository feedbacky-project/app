import React from "react";
import Form from "react-bootstrap/Form";

const UiFormControl = (props) => {
  return <Form.Control style={{minHeight: 38, resize: "none"}} required {...props}/>
};

export {UiFormControl};