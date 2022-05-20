import styled from "@emotion/styled";
import React, {useContext, useEffect, useState} from "react";
import {UiThemeContext} from "ui";
import {UiMarkdownFormControl} from "ui/form";
import getTextareaCoords from "utils/textarea-utils";

const MentionsBox = styled.div`
  background-color: var(--quaternary);
  z-index: 20;
  border-radius: var(--border-radius);
  font-size: 80%;
  outline: 1px dashed var(--disabled);
`;

const SingleMention = styled.div`
  padding: .25rem .5rem;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme};
  }
`;

const MentionableForm = (props) => {
    const {id, allMentions, onTextUpdate, onChange, ...otherProps} = props;
    const [mentions, setMentions] = useState({data: [], suggestions: [], startAt: -1, mentionSize: 0, style: {display: "none"}});
    const {getTheme} = useContext(UiThemeContext);
    useEffect(() => {
        setMentions({...mentions, data: allMentions});
        //eslint-disable-next-line
    }, [allMentions]);

    const onLocalChange = (e) => {
        const {value, selectionStart: start} = e.target;
        let char = value.substring(start - 1, start);
        if (char === "@") {
            let {x, y} = getTextareaCoords(e.target);
            setMentions({...mentions, startAt: start, style: {position: "absolute", left: `${x}px`, top: `${y}px`}, suggestions: mentions.data.slice(0, 5)});
        } else if (char === " " || value.trim() === "") {
            setMentions({...mentions, startAt: -1, mentionSize: 0, suggestions: [], style: {display: "none"}});
        } else if (mentions.startAt > -1) {
            const mention = extractMention(e.target.value, mentions.startAt);
            const filteredData = mentions.data
                .filter(m => m.username.toLowerCase().includes(mention))
                .slice(0, 5);
            setMentions({...mentions, mentionSize: mentions.mentionSize + 1, suggestions: filteredData});
        }
        onChange && onChange(e);
        onTextUpdate && onTextUpdate(e.target.value);
    }
    const onKeyDown = (e) => {
        if (e.keyCode !== 27) {
            return;
        }
        setMentions({...mentions, mentionSize: 0, startAt: -1, style: {display: "none"}});
    }
    const extractMention = (value, startAt) => {
        let mention = value.substring(startAt, value.length);
        const whiteSpaceIndex = mention.indexOf(" "),
            endAt = whiteSpaceIndex > -1 ? whiteSpaceIndex : value.length;
        mention = mention.substring(0, endAt);
        return mention.toLowerCase();
    }
    const onMentionChoose = (mention) => {
        const textarea = document.getElementById(id);
        const first = textarea.value.substr(0, mentions.startAt);
        const last = textarea.value.substr(
            mentions.startAt + mentions.mentionSize,
            textarea.value.length
        );
        textarea.value = `${first}${mention.username + "#" + mention.id}${last}`;
        textarea.focus();
        setMentions({...mentions, startAt: -1, mentionSize: 0, suggestions: [], style: {display: "none"}});

        onTextUpdate && onTextUpdate(textarea.value);
    };
    return <React.Fragment>
        <MentionsBox style={mentions.style}>
            {mentions.suggestions.map((mention, i) => {
                return <SingleMention key={mention.id} tabIndex={i} onClick={e => onMentionChoose(mention)} theme={getTheme().setAlpha(.2).toString()}>
                    {"@" + mention.username}
                </SingleMention>
            })}
        </MentionsBox>
        <UiMarkdownFormControl id={id} onKeyDown={onKeyDown} onChange={onLocalChange} {...otherProps}/>
    </React.Fragment>
};

export default MentionableForm;