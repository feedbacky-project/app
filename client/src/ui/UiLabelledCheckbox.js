import styled from "@emotion/styled";
import React, {useContext} from "react";
import {UiThemeContext} from "ui/index";

const StyledElement = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

//thanks to https://codepen.io/avstorm/pen/deRvMy
const StyledLabel = styled.label`
  display: inline-block;
  cursor: pointer;
  position: relative;
  margin: auto;
  width: 18px;
  height: 18px;
  -webkit-tap-highlight-color: transparent;
  transform: translate3d(0, 0, 0);

  &:before {
    content: "";
    position: absolute;
    top: -15px;
    left: -15px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  & svg {
    position: relative;
    z-index: 1;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: hsla(0, 0%, 0%, .25);
    stroke-width: 1.5;
    transform: translate3d(0, 0, 0);
    transition: all 0.2s ease;
  }

  .dark & svg {
    stroke: hsla(0, 0%, 95%, .5);
  }

  & svg path {
    stroke-dasharray: 60;
    stroke-dashoffset: 0;
  }

  & svg polyline {
    stroke-dasharray: 22;
    stroke-dashoffset: 66;
  }

  &:hover:before {
    opacity: 1;
  }

  &:hover svg {
    stroke: ${props => props.theme};
  }

  [id^='cbx_']:checked + & svg {
    stroke: ${props => props.theme};
  }

  [id^='cbx_']:checked + & svg path {
    stroke-dashoffset: 60;
    transition: all 0.3s linear;
  }

  [id^='cbx_']:checked + & svg polyline {
    stroke-dashoffset: 42;
    transition: all 0.2s linear;
    transition-delay: 0.15s;
  }
`;

const UiLabelledCheckbox = (props) => {
    const {id, className, checked, onChange, label} = props;
    const {getTheme} = useContext(UiThemeContext);

    return <StyledElement className={className}>
        <input id={"cbx_" + id} className={"d-none"} type="checkbox" checked={checked} onChange={onChange}/>
        <StyledLabel theme={getTheme().toString()} htmlFor={"cbx_" + id} className={"d-inline-block mr-2"}>
            <svg width="18px" height="18px" viewBox="0 0 18 18">
                <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"/>
                <polyline points="1 9 7 14 15 4"/>
            </svg>
        </StyledLabel>
        <div className={"d-inline-block align-top"}>{label || props.children}</div>
    </StyledElement>
};

export {UiLabelledCheckbox};