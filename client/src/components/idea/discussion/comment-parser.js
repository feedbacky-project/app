import tinycolor from "tinycolor2";
import PageBadge from "components/app/page-badge";
import React from "react";
import {formatUsername} from "components/util/utils";
import replace from "react-string-replace";

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
        finalMessage = replace(finalMessage, el, (match, i) => <PageBadge key={match + i} color={tinycolor(color)} text={text}/>)
    });
    //todo backward compatibility for old <span></span> badge tags
    return finalMessage;
};

const parseTag = (result, moderatorsData, tagsData) => {
    const data = result.split(";");
    if (data[0] === "data_tag") {
        return parseBoardTagData(data, tagsData);
    } else if (data[0] === "data_user") {
        return parseModeratorData(data, moderatorsData);
    }
};

const parseBoardTagData = (data, tagsData) => {
    const foundTag = tagsData.find(el => el.name === data[2]);
    if (foundTag === undefined) {
        return <PageBadge key={data[2]} text={data[2]} color={tinycolor(data[3])}/>
    }
    return <PageBadge key={data[2]} text={foundTag.name} color={tinycolor(foundTag.color)}/>
};

const parseModeratorData = (data, moderatorsData) => {
    return <span key={data[1]}>{formatUsername(parseInt(data[1]), data[2], moderatorsData)}</span>;
};

export default parseComment;