import tinycolor from "tinycolor2";
import PageBadge from "components/app/page-badge";
import React from "react";
import {formatUsername} from "components/util/utils";

const parseComment = (message, moderatorsData, tagsData) => {
    const regex = /[^{}]+(?=})/g;
    let finalMessage = message;
    message.match(regex).forEach(el => {
        finalMessage = finalMessage.replace("{" + el + "}", parseTag(el, moderatorsData, tagsData));
    });
    return finalMessage;
};

const parseTag = (result, moderatorsData, tagsData) => {
    const data = result.split(";");
    if(data[0] === "data_tag") {
        return parseBoardTagData(data, tagsData);
    } else if(data[0] === "data_user") {
        return parseModeratorData(data, moderatorsData);
    }
};

const parseBoardTagData = (data, tagsData) => {
    const foundTag = tagsData.find(el => el.id === data[1]);
    if(foundTag === undefined) {
        return <PageBadge text={data[2]} color={tinycolor(data[3])} className="mr-1"/>
    }
    return <PageBadge text={foundTag.name} color={tinycolor(foundTag.color)} className="mr-1"/>
};

const parseModeratorData = (data, moderatorsData) => {
    const foundMod = moderatorsData.find(el => el.id === data[1]);
    if(foundMod === undefined) {
        return formatUsername(data[1], data[2]);
    }
    return formatUsername(data[1], data[2], moderatorsData);
};

export default parseComment;