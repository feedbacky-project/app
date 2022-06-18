import styled from "@emotion/styled";
import LoadableReaction from "components/commons/LoadableReaction";
import {AppContext} from "context";
import React, {useContext} from "react";
import {MdOutlineAddReaction} from "react-icons/md";
import {UiTooltip} from "ui";
import {UiClassicButton} from "ui/button";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";

const ReactionTitle = styled.div`
  color: var(--font-color);
  font-size: 80%;
  text-align: center;
  font-weight: bold;
  margin-bottom: .5em;
`;

const AddReactionOverlay = styled(UiClassicButton)`
  cursor: pointer;
  display: inline-block;
  padding: .1rem .2rem;
  border-radius: var(--border-radius);
  transition: var(--hover-transition);
  background-color: transparent;

  &:hover {
    background-color: hsla(0, 0%, 0%, .15) !important;
  }

  .dark &:hover {
    background-color: hsla(0, 0%, 95%, .15) !important;
  }
`;

const AddReaction = styled(MdOutlineAddReaction)`
  //proper alignment
  transform: translateY(1px);
  vertical-align: text-top;

  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }
`;

const ReactionContainer = styled.div`
  display: inline-block;

  & > div:last-child {
    margin-right: .5rem;
  }
`;

const Reaction = styled.img`
  width: 13px;
  height: 13px;
  transform: translateY(-1px);
  vertical-align: middle;
`;

const ReactionsBox = ({className = null, parentObjectId, reactionsData, onReact, onUnreact}) => {
    const {serviceData, user} = useContext(AppContext);

    const onReaction = (emoteId) => {
        let reactions = reactionsData.filter(r => r.reactionId === emoteId) || [];
        let isReacted = reactions.find(r => r.user.id === user.data.id) !== undefined;
        if (!isReacted) {
            return onReact(parentObjectId, emoteId);
        } else {
            return onUnreact(parentObjectId, emoteId);
        }
    };
    let moreReactionsToAdd = false;
    let i = 0;
    return <div className={className}>
        <ReactionContainer>
            {serviceData.emojisData.map(emote => {
                let reactions = reactionsData.filter(r => r.reactionId === emote.id) || [];
                let selected = reactions.find(r => r.user.id === user.data.id) !== undefined;
                if (reactions.length === 0) {
                    moreReactionsToAdd = true;
                    return <React.Fragment key={emote.id}/>
                }
                let whoReacted = "";
                let i = 0;
                reactions.forEach(r => {
                    if (i >= 3) {
                        i++;
                        return;
                    }
                    whoReacted += r.user.username + ", ";
                    i++;
                });
                whoReacted = whoReacted.substring(0, whoReacted.length - 2);
                if (i > 3) {
                    whoReacted += " and " + (reactions.length - 3) + " more";
                }
                whoReacted += " reacted with " + emote.name;
                return <LoadableReaction key={emote.id} isSelected={selected} onReact={() => onReaction(emote.id)}>
                    <UiTooltip id={parentObjectId + emote.id} text={whoReacted}>
                    <span>
                        <Reaction className={"mr-2"} alt={emote.name} src={emote.path}/>
                        <span style={{fontSize: "90%"}}>{reactions.length}</span>
                    </span>
                    </UiTooltip>
                </LoadableReaction>
            })}
        </ReactionContainer>
        {
            moreReactionsToAdd &&
            <UiDropdown label={"Reactions"} className={"d-inline-block"} toggleClassName={"p-0"} toggle={<AddReactionOverlay label={"React"}><AddReaction/></AddReactionOverlay>} menuStyle={{minWidth: "6.5rem"}}>
                <ReactionTitle>Pick a Reaction</ReactionTitle>
                {serviceData.emojisData.map(emote => {
                    let reactions = reactionsData.filter(r => r.reactionId === emote.id) || [];
                    if (reactions.length !== 0) {
                        return <React.Fragment key={"reaction_" + emote.id}/>
                    }
                    i++;
                    return <React.Fragment key={"reaction_" + emote.id}>
                        <UiDropdownElement className={"d-inline"} onClick={() => onReaction(emote.id)}>
                            <Reaction alt={emote.name} src={emote.path}/>
                        </UiDropdownElement>
                        {i === 3 && <div className={"py-1"}/>}
                    </React.Fragment>
                })}
            </UiDropdown>
        }
    </div>
};

export default ReactionsBox;