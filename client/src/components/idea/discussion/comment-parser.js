import styled from "@emotion/styled";
import React from "react";
import replace from "react-string-replace";
import tinycolor from "tinycolor2";
import {UiBadge, UiClickableTip, UiKeyboardInput, UiPrettyUsername} from "ui";
import {UiButton} from "ui/button";

const parseComment = (message, moderatorsData, tagsData) => {
    const regex = /[^{}]+(?=})/g;
    let finalMessage = message;
    message.match(regex) && message.match(regex).forEach(el => {
        finalMessage = replace(finalMessage, "{" + el + "}", (match, i) => parseTag(el, moderatorsData, tagsData, i));
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

const parseTag = (result, moderatorsData, tagsData, index) => {
    const data = result.split(";");
    if (data[0] === "data_tag") {
        return parseBoardTagData(data, tagsData, index);
    } else if (data[0] === "data_user") {
        return parseModeratorData(data, index);
    } else if (data[0] === "data_diff_view") {
        return parseDiffView(data, index);
    }
};

const parseBoardTagData = (data, tagsData, index) => {
    const foundTag = tagsData.find(el => el.id === parseInt(data[1]));
    if (foundTag === undefined) {
        return <UiBadge key={data[1] + index} color={tinycolor(data[3])}>{data[2]}</UiBadge>
    }
    return <UiBadge key={data[1] + index} color={tinycolor(foundTag.color)}>{foundTag.name}</UiBadge>
};

const parseModeratorData = (data, index) => {
    //simulate user from user context, WARNING, might be unsafe in the future!
    return <span className={"font-weight-bold"} key={data[1] + index}>
        <UiPrettyUsername user={{id: parseInt(data[1]), username: data[2]}}/>
    </span>
};

const DiffViewButton = styled.div`
  display: inline-block;
  color: var(--font-color);
  cursor: pointer;
`;

const parseDiffView = (data, index) => {
    return <DiffViewButton>
        <UiClickableTip id={data[1] + index} title={"Diff View"} description={<React.Fragment>
            <strong>From: </strong>
            <UiKeyboardInput>{data[2]}</UiKeyboardInput>
            <br/>
            <strong>To: </strong>
            <UiKeyboardInput>{data[3]}</UiKeyboardInput>
        </React.Fragment>} icon={<UiButton tiny={true} label={"View Diff"}>{data[1]}</UiButton>}/>
    </DiffViewButton>
};

export default parseComment;
