import AppContext from "context/AppContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import {Card} from "react-bootstrap";
import styled from "@emotion/styled";

const OptionCard = styled(Card)`
  min-width: 150px;
  width: 200px;
  max-width: 250px;
`;

const SetupCard = ({icon, chosen = false, text, onClick, className = ""}) => {
    const {getTheme} = useContext(AppContext);
    let style;
    if(chosen) {
        style = {border: "2px solid " + getTheme()};
    } else {
        style = {border: "2px solid transparent"};
    }
    return <OptionCard className={className} onClick={onClick} style={style}>
        <Card.Body className={"text-center"}>
            {icon}
            <br className={"my-3"}/>
            <strong style={{fontSize: "1.25rem"}}>{text}</strong>
        </Card.Body>
    </OptionCard>
};

export default SetupCard;

SetupCard.propTypes = {
    icon: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
};