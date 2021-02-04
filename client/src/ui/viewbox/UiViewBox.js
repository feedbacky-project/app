import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from 'react';
import {UiCol, UiRow} from "ui/grid";
import {UiCard} from "ui/UiCard";

const ViewBox = styled.div`
  z-index: 1;
  position: relative;
  top: 35px;
  color: white;
  padding: 1rem 1.5rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
`;

const ViewBoxContent = styled(UiRow)`
  padding: 3.25rem 1rem 1.5rem 1rem;
  margin-bottom: 1rem;
`;

export const UiViewBoxBackground = styled(UiCol)`
  background-color: white;
  border-radius: .35rem;
  box-shadow: var(--box-shadow);
  
  .dark & {
    background-color: var(--dark-secondary);
    box-shadow: var(--dark-box-shadow) !important;
    
    .form-control:not(:disabled) {
      background-color: var(--dark-quaternary) !important;
    }
  }
`;

const UiViewBox = (props) => {
    const {getTheme} = useContext(AppContext);
    const {theme = getTheme(), title, description, children} = props;
    return <React.Fragment>
        <UiCard as={ViewBox} style={{backgroundColor: theme}} bodyClassName={"p-0"}>
            <h3 className={"mb-0"}>{title}</h3>
            <div>{description}</div>
        </UiCard>
        <UiViewBoxBackground>
            <ViewBoxContent>
                {children}
            </ViewBoxContent>
        </UiViewBoxBackground>
    </React.Fragment>
};

export {UiViewBox};

UiViewBox.propTypes = {
    theme: PropTypes.object,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired
};