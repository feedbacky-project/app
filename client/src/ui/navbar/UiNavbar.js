import styled from "@emotion/styled";
import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {UiContainer, UiRow} from "ui/grid";
import {UiThemeContext} from "ui/index";

const StyledNavbar = styled.div`
  background-color: var(--tertiary);
  padding-top: .3rem;
  z-index: 3;
  flex-flow: row nowrap;
  justify-content: flex-start;
  position: relative;
  flex-wrap: wrap;
  align-items: center;
  box-shadow: var(--box-shadow);
`;

const Brand = styled(Link)`
  font-weight: 500;
  color: ${props => props.theme};
  flex: 1 1;
  margin-right: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 1.15rem;
  display: inline-block;
  padding: .25rem 0;

  &:hover {
    color: ${props => props.theme};
  }
`;

const NavbarSelectedOption = styled(Link)`
  &:hover {
    color: ${props => props.theme.toString()};
  }

  color: ${props => props.theme.toString()};
  margin-bottom: -4px;
  padding-top: .5rem;
  padding-left: .4rem;
  padding-right: .4rem;
  border-bottom: 2px solid ${props => props.border.toString()};
`;

const NavbarOption = styled(Link)`
  color: var(--font-color);
  margin-bottom: -4px;
  padding-top: .5rem;
  padding-left: .4rem;
  padding-right: .4rem;
  transition: var(--hover-transition);
  font-weight: normal !important;

  &:hover {
    color: ${props => props.theme.toString()};
  }
`;

const UiNavbar = (props) => {
    const {children, innerRef, ...otherProps} = props;
    const {getTheme} = useContext(UiThemeContext);

    return <StyledNavbar role={"navigation"} ref={innerRef} {...otherProps}>
        {children}
        <UiContainer>
            <UiRow style={{paddingTop: "0.1rem", borderBottom: "2px solid " + getTheme().setAlpha(.1), margin: 0}}/>
        </UiContainer>
    </StyledNavbar>
};

export {UiNavbar, Brand, NavbarSelectedOption, NavbarOption};