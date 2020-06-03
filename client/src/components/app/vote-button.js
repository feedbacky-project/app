import React, {useContext} from "react";
import Button from "react-bootstrap/Button";
import AppContext from "context/app-context";
import {FiChevronsUp, FiChevronUp} from "react-icons/all";
import PropTypes from "prop-types";

const VoteButton = ({upvoted, votersAmount, onVote}) => {
    const context = useContext(AppContext);
    let color = context.getTheme();

    let vote;
    if (!upvoted) {
        color = color.setAlpha(.7);
        vote = <FiChevronUp style={{color}}/>;
    } else {
        vote = <FiChevronsUp style={{color}}/>;
    }
    return <span className="my-auto">
        <Button className="vote-btn" onClick={onVote} variant="">
            {vote}
            <strong className="d-block" style={{color: color}}>{votersAmount}</strong>
        </Button>
    </span>
};

VoteButton.propTypes = {
    upvoted: PropTypes.bool.isRequired,
    votersAmount: PropTypes.number.isRequired,
    onVote: PropTypes.func.isRequired
};

export default VoteButton;