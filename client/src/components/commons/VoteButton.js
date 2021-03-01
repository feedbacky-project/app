import styled from "@emotion/styled";
import axios from "axios";
import AppContext from "context/AppContext";
import IdeaContext from "context/IdeaContext";
import PropTypes from "prop-types";
import React, {useContext} from "react";
import {FiChevronsUp, FiChevronUp} from "react-icons/all";
import {UiClassicButton} from "ui/button";
import {popupError} from "utils/basic-utils";

const VoteBtn = styled(UiClassicButton)`
  line-height: 16px;
  min-width: 35px;
  min-height: 45px;
  padding: .25rem .5rem;
  margin: 0;
  box-shadow: none !important;
  background-color: transparent !important;
  transition: .2s ease-in-out;
  &:hover, &:focus {
   background-color: transparent !important;
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

const VoteButton = ({idea, onVote, animationRef}) => {
    const {getTheme} = useContext(AppContext);
    const {ideaData} = useContext(IdeaContext);
    let color = getTheme();
    const doVote = () => {
        let request;
        let upvoted;
        let votersAmount;
        if (idea.upvoted) {
            request = "DELETE";
            upvoted = false;
            votersAmount = idea.votersAmount - 1;
        } else {
            request = "POST";
            upvoted = true;
            votersAmount = idea.votersAmount + 1;
        }
        axios({
            method: request,
            url: "/ideas/" + idea.id + "/voters"
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                popupError();
                return;
            }
            if (upvoted) {
                animationRef.current.classList.add("upvote-animation");
            } else {
                animationRef.current.classList.remove("upvote-animation");
            }
            onVote(upvoted, votersAmount);
        });
    };

    if (!ideaData.upvoted) {
        return <ToUpvoteBtn label={"Upvote"} onClick={doVote} variant={""}>
            <ToUpvoteIcon className={"to-upvote"}/>
            <strong className={"d-block"}>{ideaData.votersAmount}</strong>
        </ToUpvoteBtn>
    } else {
        return <VoteBtn label={"Downvote"} onClick={doVote} variant={""}>
            <FiChevronsUp className={"upvoted"} style={{color}}/>
            <strong className={"d-block"} style={{color: color}}>{ideaData.votersAmount}</strong>
        </VoteBtn>
    }
};

VoteButton.propTypes = {
    onVote: PropTypes.func.isRequired
};

export default VoteButton;