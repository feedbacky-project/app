import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React, {useContext} from 'react';
import {UiCol, UiRow} from "ui/grid";
import {UiThemeContext} from "ui/index";
import {UiCard} from "ui/UiCard";

const ViewBox = styled(UiCard)`
  z-index: 2;
  position: relative;
  top: 35px;
  color: white;
  padding: 1rem 1.5rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;

  @media (min-width: 576px) {
    width: 60%;
  }
`;

const TitleOverlayParent = styled.div`
  position: relative;
  top: 35px;
  
  padding-left: 1.5rem;
  padding-right: 1.5rem;

  @media (max-width: 576px) {
    margin-left: 1.5rem;
    margin-right: 1.5rem;
    padding-left: 0;
    padding-right: 0;
  }
`;

const TitleOverlayChild = styled(UiCol)`
  z-index: 1;
  padding: 1.25rem 0;
  position: absolute;
  bottom: 0;
  background-color: var(--background);

  @media (min-width: 576px) {
    width: 60%;
  }
`;

const ViewBoxContent = styled(UiRow)`
  padding: 3.25rem 1rem 1.5rem 1rem;
  margin-bottom: 1rem;
`;

export const UiViewBoxBackground = styled(UiCol)`
  background-color: var(--secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);

  input:not(:disabled), textarea:not(:disabled) {
    background-color: var(--tertiary) !important;
  }

  .dark & {
    input:not(:disabled), textarea:not(:disabled) {
      background-color: var(--quaternary) !important;
    }
  }
`;

export const UiViewBoxDangerBackground = styled(UiViewBoxBackground)`
  border: hsla(355, 100%, 60%, .4) 1px dashed;

  .dark & {
    box-shadow: none;
    border: hsla(2, 100%, 60%, .3) 1px dashed;
  }
`;

const UiViewBox = (props) => {
    const {getTheme} = useContext(UiThemeContext);
    const {theme = getTheme(), title, description, children} = props;

    return <React.Fragment>
        <ViewBox style={{color: theme, backgroundColor: theme.clone().setAlpha(.1)}} bodyClassName={"p-0"}>
            <h3 className={"mb-0"}>{title}</h3>
            <div>{description}</div>
        </ViewBox>
        <TitleOverlayParent><TitleOverlayChild as={UiCard}/></TitleOverlayParent>
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