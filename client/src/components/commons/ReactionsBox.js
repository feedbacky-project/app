import styled from "@emotion/styled";
import LoadableReaction from "components/idea/discussion/LoadableReaction";
import {AppContext} from "context";
import React, {useContext} from "react";
import {MdOutlineAddReaction} from "react-icons/all";
import {UiTooltip} from "ui";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";

const ReactionTitle = styled.div`
  color: var(--font-color);
  font-size: 80%;
  text-align: center;
  font-weight: bold;
  margin-bottom: .5em;
`

const AddReaction = styled(MdOutlineAddReaction)`
  cursor: pointer;
  //proper alignment
  transform: translateY(-1px);
  vertical-align: middle;
  transition: var(--hover-transition);

  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }

  &:hover {
    color: hsl(0, 0%, 0%);
  }

  .dark &:hover {
    color: hsl(0, 0%, 95%) !important;
  }
`

const Reaction = styled.img`
  width: 14px;
  height: 14px;
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
                        <span>{reactions.length}</span>
                    </span>
                </UiTooltip>
            </LoadableReaction>
        })}
        {
            moreReactionsToAdd &&
            <UiDropdown label={"Reactions"} className={"d-inline-block"} toggleClassName={"p-0"} toggle={<AddReaction/>} menuStyle={{minWidth: "6.5rem"}}>
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