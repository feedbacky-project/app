import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";

const FormControl = styled.input`
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  border: none;
  overflow: visible;
  margin: 0;
  border-radius: var(--border-radius);
  transition: var(--hover-transition);
  
  min-height: 36px;
  resize: none;
  color: hsla(0, 0%, 0%, .6);
  background-color: var(--secondary);
  box-shadow: var(--box-shadow);
  &.darker {
    background-color: var(--background);
  }
  &:focus {
    box-shadow: var(--box-shadow);
    outline: none; //bootstrap override
  }
  &:disabled {
    background-color: var(--disabled);
  }
  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }
  &:focus {
    background-color: var(--tertiary) !important;
  }
  
  &:-moz-focusring {
    text-shadow: none !important;
  }
  &::placeholder {
    font-size: 15px;
    opacity: .55;
    color: hsla(0, 0%, 0%, .9);
  }
  .dark &::placeholder {
    color: hsl(0, 0%, 75%) !important;
  }
`;

const UiFormControl = (props) => {
    const {label, innerRef, ...otherProps} = props;

    return <FormControl ref={innerRef} required aria-label={label} {...otherProps}/>
};

UiFormControl.propTypes = {
    label: PropTypes.string.isRequired,
};

export {UiFormControl};