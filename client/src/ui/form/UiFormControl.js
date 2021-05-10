import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";

const FormControl = styled.input`
  display: block;
  width: 100%;
  height: calc(1.5em + 0.75rem);
  padding: 0.375rem 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  border: none;
  overflow: visible;
  margin: 0;
  border-radius: var(--border-radius);
  
  min-height: 36px;
  resize: none;
  color: hsla(0, 0%, 0%, .6);
  background-color: var(--secondary);
  box-shadow: var(--box-shadow);
  transition: var(--hover-transition);
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
    background-color: var(--dark-secondary) !important;
    box-shadow: var(--dark-box-shadow) !important;
  }
  .dark &:focus {
    background-color: var(--dark-tertiary) !important;
  }
  
  &:-moz-focusring {
    text-shadow: none !important;
  }
  &::placeholder {
    font-size: 15px;
    color: hsla(0, 0%, 0%, .9);
  }
  .dark &::placeholder {
    color: hsl(0, 0%, 75%) !important;
  }
  .dark &:disabled {
    background-color: var(--dark-disabled) !important;
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