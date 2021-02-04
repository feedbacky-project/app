import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {Link} from "react-router-dom";

const StyledNavbar = styled.div`
  background-color: ${props => props.theme};
  font-weight: 300;
  padding: .25rem 0;
  z-index: 3;
  flex-flow: row nowrap;
  justify-content: flex-start;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  box-shadow: var(--box-shadow);
  
  .dark & {
    box-shadow: var(--dark-box-shadow) !important;
  }
`;

const Brand = styled(Link)`
  color: white;
  flex: 1 1;
  margin-right: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 1.25rem;
  display: inline-block;
  padding: .25rem 0;
  &:hover {
    color: white;
  }
`;

const UiNavbar = (props) => {
    const {getTheme} = useContext(AppContext);
    const {theme = getTheme(), children, ...otherProps} = props;
    return <StyledNavbar role={"navigation"} theme={theme.toString()} {...otherProps}>
        {children}
    </StyledNavbar>
};

export {UiNavbar, Brand};