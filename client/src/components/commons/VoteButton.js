import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import IdeaContext from "context/IdeaContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import Button from "react-bootstrap/Button";
import {FiChevronsUp, FiChevronUp} from "react-icons/all";

const VoteBtn = styled(Button)`
  line-height: 16px;
  min-width: 35px;
  min-height: 45px;
  padding: .25rem .5rem;
  margin: 0;
  box-shadow: none !important;
  
  .to-upvote, .upvoted {
    transition: .2s ease-in-out;
  }

  &:hover {
     & .to-upvote {
       animation: UpVote 1s linear infinite;
     }
     
     & .upvoted {
      animation: DownVote 1s linear infinite;
     }
     
     @keyframes UpVote {
       0%, 100% {
         transform: translateY(0px);
       }
       50% {
         transform: translateY(-5px);
       }
     }
    
     @keyframes DownVote {
       0% {
         transform: rotate(180deg);
       }
       50% {
         transform: rotate(180deg) translateY(5px);
       }
       100% {
        transform: rotate(180deg);
       }
     }
  }
  
  @media (max-width: 576px) {
    & {
      font-size: 1rem;
    }
  }
  
`;

const VoteButton = ({onVote}) => {
    const {getTheme} = useContext(AppContext);
    const {ideaData} = useContext(IdeaContext);
    let color = getTheme();

    let vote;
    if (!ideaData.upvoted) {
        color = color.setAlpha(.7);
        vote = <FiChevronUp className={"to-upvote"} style={{color}}/>;
    } else {
        vote = <FiChevronsUp className={"upvoted"} style={{color}}/>;
    }
    return <span className={"my-auto"}>
        <VoteBtn onClick={onVote} variant={""}>
            {vote}
            <strong className={"d-block"} style={{color: color}}>{ideaData.votersAmount}</strong>
        </VoteBtn>
    </span>
};

VoteButton.propTypes = {
    onVote: PropTypes.func.isRequired
};

export default VoteButton;