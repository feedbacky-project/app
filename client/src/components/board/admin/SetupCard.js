import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import {UiCard} from "ui";

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
`;

const SetupCard = ({icon, chosen = false, text, onClick, className = ""}) => {
    const {getTheme} = useContext(AppContext);
    let style;
    if (chosen) {
        style = {border: "2px solid " + getTheme()};
    } else {
        style = {border: "2px solid transparent"};
    }
    return <OptionCard className={className} bodyClassName={"text-center"} onClick={onClick} style={style}>
        {icon}
        <br className={"my-3"}/>
        <strong style={{fontSize: "1.25rem"}}>{text}</strong>
    </OptionCard>
};

export default SetupCard;

SetupCard.propTypes = {
    icon: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
};