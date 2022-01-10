import styled from "@emotion/styled";
import LoadableReaction from "components/idea/discussion/LoadableReaction";
import {AppContext} from "context";
import React, {useContext} from "react";
import {MdOutlineAddReaction} from "react-icons/all";
import {UiDropdown, UiDropdownElement} from "ui/dropdown";

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

const ReactionsBox = ({parentObjectId, reactionsData, onReact, onUnreact}) => {
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
    return <div>
        {serviceData.emojisData.map(emote => {
            let reactions = reactionsData.filter(r => r.reactionId === emote.id) || [];
            let selected = reactions.find(r => r.user.id === user.data.id) !== undefined;
            if (reactions.length === 0) {
                moreReactionsToAdd = true;
                return <React.Fragment/>
            }
            return <LoadableReaction isSelected={selected} onReact={() => onReaction(emote.id)}>
                <img className={"align-middle move-top-1px mr-2"} alt={emote.name} src={emote.path} width={14} height={14}/>
                <span>{reactions.length}</span>
            </LoadableReaction>
        })}
        {
            moreReactionsToAdd &&
            <UiDropdown label={"Reactions"} className={"d-inline-block"} toggleClassName={"p-0"} toggle={<AddReaction/>}>
                {serviceData.emojisData.map(emote => {
                    let reactions = reactionsData.filter(r => r.reactionId === emote.id) || [];
                    if (reactions.length !== 0) {
                        return <React.Fragment/>
                    }
                    return <UiDropdownElement className={"d-inline"} onClick={() => onReaction(emote.id)}>
                        <img className={"align-middle move-top-1px"} alt={emote.name} src={emote.path} width={14} height={14}/>
                    </UiDropdownElement>
                })}
            </UiDropdown>
        }
    </div>
};

export default ReactionsBox;