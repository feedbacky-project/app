import React from "react";
import replace from "react-string-replace";
import tinycolor from "tinycolor2";
import {UiBadge, UiPrettyUsername} from "ui";

const parseComment = (message, moderatorsData, tagsData) => {
    const regex = /[^{}]+(?=})/g;
    let finalMessage = message;
    message.match(regex) && message.match(regex).forEach(el => {
        finalMessage = replace(finalMessage, "{" + el + "}", (match, i) => parseTag(el, moderatorsData, tagsData));
    });
    //backward compatibility
    const spanRegex = /<span[^>]*>([\s\S]*?)<\/span>/g;
    message.match(spanRegex) && message.match(spanRegex).forEach(el => {
        //local regex seems to work while global one doesn't for multi tags per comment
        const span = /<span[^>]*>([\s\S]*?)<\/span>/g;
        const text = span.exec(el)[1];
        const colorRegex = /<span[^)>]*style='background-color: ([^)>]*)'[^)>]*>/g;
        const color = tinycolor(colorRegex.exec(el)[1]);
        finalMessage = replace(finalMessage, el, (match, i) => <UiBadge key={match + i} color={tinycolor(color)}>{text}</UiBadge>)
    });
    //todo backward compatibility for old <span></span> badge tags
    return finalMessage;
};

const parseTag = (result, moderatorsData, tagsData) => {
    const data = result.split(";");
    if (data[0] === "data_tag") {
        return parseBoardTagData(data, tagsData);
    } else if (data[0] === "data_user") {
        return parseModeratorData(data);
    }
};

const parseBoardTagData = (data, tagsData) => {
    const foundTag = tagsData.find(el => el.name === data[2]);
    if (foundTag === undefined) {
        return <UiBadge key={data[2]} color={tinycolor(data[3])}>{data[2]}</UiBadge>
    }
    return <UiBadge key={data[2]} color={tinycolor(foundTag.color)}>{foundTag.name}</UiBadge>
};

const parseModeratorData = (data) => {
    //simulate user from user context, WARNING, might be unsafe in the future!
    return <span key={data[1]}>
        <UiPrettyUsername user={{id: parseInt(data[1]), username: data[2]}}/>
    </span>
};

export default parseComment;