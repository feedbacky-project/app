import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import {UiCard, UiThemeContext} from "ui";

const OptionCard = styled(UiCard)`
  min-width: 150px;
  width: 200px;
  max-width: 250px;
  cursor: pointer;
  transition: var(--hover-transition);
`;

export const SetupCardIcon = styled.div`
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-top: .6rem;
`;

const CardTitle = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  margin-top: .6rem;
`;

const SetupCard = ({icon, chosen = false, text, onClick, className = ""}) => {
    const {getTheme} = useContext(UiThemeContext);
    let style;
    if (chosen) {
        style = {outline: "1px dashed " + getTheme()};
    }
    return <OptionCard className={className} bodyClassName={"text-center"} onClick={onClick} style={style}>
        {icon}
        <br/>
        <CardTitle>{text}</CardTitle>
    </OptionCard>
};

export default SetupCard;

SetupCard.propTypes = {
    icon: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
};