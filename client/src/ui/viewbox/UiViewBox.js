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
        <UiCol className={"view-box-bg"}>
            <UiRow className={"py-4 px-3 px-0 pt-5 mb-3"}>
                {children}
            </UiRow>
        </UiCol>
    </React.Fragment>
};

export {UiViewBox};

UiViewBox.propTypes = {
    theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired
};