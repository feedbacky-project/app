import styled from "@emotion/styled";
import React from "react";

const MarkdownBox = styled.div`
  word-break: break-word;
  & a {
    color: hsl(195, 100%, 30%);
    &:hover {
      color: hsl(195, 100%, 15%);
    }
  }
  .dark & a {
    color: hsl(208, 100%, 62%) !important;

    &:hover {
      color: hsl(208, 100%, 75%) !important;
    }
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

const MarkdownContainer = ({text}) => {
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
    return <MarkdownBox dangerouslySetInnerHTML={{__html: parseEmojis(marked.parseInline(text, {breaks: true}))}}/>
};

export default MarkdownContainer;