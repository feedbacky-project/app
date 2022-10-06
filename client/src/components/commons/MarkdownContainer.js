import styled from "@emotion/styled";
import {parseMentionsHtmlUnsafe} from "components/idea/discussion/comment-parser";
import React, {useContext} from "react";
import {UiThemeContext} from "ui";
import {truncateText} from "utils/basic-utils";

const MarkdownBox = styled.div`
  word-break: break-word;
  //equivalent of hsla(0, 0%, 0%, .75) without alpha under --background variable
  color: hsl(240, 1%, 23%);
  .dark & {
    //equivalent of hsla(0, 0%, 95%, .75) without alpha under .dark --background variable 
    color: hsl(210, 2%, 74%);
  }
  & a {
    color: ${props => props.theme.toHexString()};
    &:hover {
      color: ${props => props.theme.clone().darken(10).toHexString()};
    }
  }
  .dark & a:hover {
    color: ${props => props.theme.clone().lighten(10).toHexString()} !important;
  }
  & img {
    max-width: 100%;
    width: auto;
  }
`;

const marked = require("marked");
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow noopener noreferrer" ');
};
marked.setOptions({renderer: renderer, ...marked.options,});

const MarkdownContainer = (props) => {
    const {getTheme} = useContext(UiThemeContext);
    const {text, stripped, truncate = -1, ...otherProps} = props;

    const parseEmojis = (preText) => {
        let replaced = preText;
        replaced = replaced.replace(":)", "\uD83D\uDE04");
        replaced = replaced.replace(";)", "\uD83D\uDE09");
        replaced = replaced.replace("<3", "\uD83D\uDE0D");
        replaced = replaced.replace("8)", "\uD83D\uDE0E");
        replaced = replaced.replace("x)", "\uD83D\uDE06");
        replaced = replaced.replace(":P", "\uD83D\uDE1B");
        replaced = replaced.replace(":O", "\uD83D\uDE2E");
        replaced = replaced.replace(":(", "\uD83D\uDE26");
        replaced = replaced.replace(":@", "\uD83D\uDE21");
        return replaced;
    };
    let html = marked.parseInline(text, {breaks: true});
    if(stripped) {
        html = html.replace(/<br\s*\/?>/ig, " ").replace(/(&nbsp;|<([^>]+)>)/ig, "");
    }
    if(truncate > 0) {
        html = truncateText(html, truncate);
    }
    html = parseMentionsHtmlUnsafe(html, getTheme());

    //convert properly to avoid emotes issues
    const span = document.createElement("span");
    span.innerHTML = html;
    const converted = parseEmojis(span.innerHTML);
    return <MarkdownBox theme={getTheme()} dangerouslySetInnerHTML={{__html: converted}} {...otherProps}/>
};

export default MarkdownContainer;