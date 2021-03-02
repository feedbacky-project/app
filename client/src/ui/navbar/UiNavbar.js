import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {UiContainer, UiRow} from "ui/grid";

const StyledNavbar = styled.div`
  background-color: var(--tertiary);
  font-weight: 300;
  padding-top: .3rem;
  z-index: 3;
  flex-flow: row nowrap;
  justify-content: flex-start;
  position: relative;
  flex-wrap: wrap;
  align-items: center;
  
  .dark & {
    background-color: var(--dark-tertiary);
    box-shadow: var(--dark-box-shadow) !important;
  }
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
  margin-top: .5rem;
  margin-right: .75rem;
  border-bottom: 2px solid ${props => props.border.toString()};
`;

const NavbarOption = styled(Link)`
  color: var(--font-color);
  margin-bottom: -4px;
  margin-top: .5rem;
  margin-right: .75rem;
  transition: var(--hover-transition);
  
  &:hover {
    color: var(--font-color);
    transform: var(--hover-transform-scale-sm);
  }
  
  .dark & {
    color: var(--dark-font-color);
  }
`;

const UiNavbar = (props) => {
    const {children, innerRef, ...otherProps} = props;
    const context = useContext(AppContext);
    return <StyledNavbar role={"navigation"} ref={innerRef} {...otherProps}>
        {children}
        <UiContainer>
            <UiRow style={{paddingTop: "0.1rem", borderBottom: "2px solid " + context.getTheme().setAlpha(.1), margin: 0}}/>
        </UiContainer>
    </StyledNavbar>
};

export {UiNavbar, Brand, NavbarSelectedOption, NavbarOption};