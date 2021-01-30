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
  
  &:focus {
    outline: 1px dotted black;
  }
  
  .dark &:focus {
    outline: 1px dotted white;
  }

  //hide non-essential motion if requested
  @media(prefers-reduced-motion: no-preference) {
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
  }
  
  @media (max-width: 576px) {
    & {
      font-size: 1rem;
    }
  }
`;

const ToUpvoteBtn = styled(VoteBtn)`
   &, &:hover {
     color: hsla(0, 0%, 0%, .6);
   }
   
  .dark & {
    color: hsla(0, 0%, 95%, .6);
  }
`;

const ToUpvoteIcon = styled(FiChevronUp)`
  color: hsla(0, 0%, 0%, .6);
   
  .dark & {
    color: hsla(0, 0%, 95%, .6);
  }
`;

const VoteButton = ({onVote}) => {
    const {getTheme} = useContext(AppContext);
    const {ideaData} = useContext(IdeaContext);
    let color = getTheme();

    let btn;
    if (!ideaData.upvoted) {
        btn = <ToUpvoteBtn onClick={onVote} variant={""}>
            <ToUpvoteIcon className={"to-upvote"}/>
            <strong className={"d-block"}>{ideaData.votersAmount}</strong>
        </ToUpvoteBtn>
    } else {
        btn = <VoteBtn onClick={onVote} variant={""}>
            <FiChevronsUp className={"upvoted"} style={{color}}/>
            <strong className={"d-block"} style={{color: color}}>{ideaData.votersAmount}</strong>
        </VoteBtn>
    }
    return <span className={"my-auto"}>
        {btn}
    </span>
};

VoteButton.propTypes = {
    onVote: PropTypes.func.isRequired
};

export default VoteButton;