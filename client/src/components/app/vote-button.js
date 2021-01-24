import React, {useContext} from "react";
import Button from "react-bootstrap/Button";
import AppContext from "context/app-context";
import {FiChevronsUp, FiChevronUp} from "react-icons/all";
import PropTypes from "prop-types";
import IdeaContext from "../../context/idea-context";

const VoteButton = ({onVote}) => {
    const context = useContext(AppContext);
    const {ideaData} = useContext(IdeaContext);
    let color = context.getTheme();

    let vote;
    if (!ideaData.upvoted) {
        color = color.setAlpha(.7);
        vote = <FiChevronUp style={{color}}/>;
    } else {
        vote = <FiChevronsUp style={{color}}/>;
    }
    return <span className="my-auto">
        <Button className="vote-btn" onClick={onVote} variant="">
            {vote}
            <strong className="d-block" style={{color: color}}>{ideaData.votersAmount}</strong>
        </Button>
    </span>
};

VoteButton.propTypes = {
    onVote: PropTypes.func.isRequired
};

export default VoteButton;