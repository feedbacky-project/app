import React, {useContext} from "react";
import Button from "react-bootstrap/Button";
import AppContext from "context/app-context";
import {FiChevronsUp, FiChevronUp} from "react-icons/all";
import PropTypes from "prop-types";

const VoteButton = ({upvoted, votersAmount, onVote, justVoted = false}) => {
    const context = useContext(AppContext);
    let color = context.getTheme();

    let vote;
    if (!upvoted) {
        color = color.setAlpha(.7);
        vote = <FiChevronUp style={{color}}/>;
    } else {
        vote = <FiChevronsUp style={{color}}/>;
    }
    let classes = "vote-btn";
    if (justVoted) {
        classes += " upvote-animation";
    }
    return <span className="my-auto">
        <Button className={classes} onClick={onVote} variant="">
            {vote}
            <strong className="d-block" style={{color: color}}>{votersAmount}</strong>
        </Button>
    </span>
};

VoteButton.propTypes = {
    upvoted: PropTypes.bool.isRequired,
    votersAmount: PropTypes.number.isRequired,
    onVote: PropTypes.func.isRequired,
    justVoted: PropTypes.bool
};

export default VoteButton;