import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import MarkdownContainer from "components/commons/MarkdownContainer";
import {SvgNotice} from "components/commons/SvgNotice";
import React from "react";
import {UiCol} from "ui/grid";
import {UiViewBoxBackground} from "ui/viewbox/UiViewBox";

const BoardChangelogBox = ({changelogData}) => {
    if (changelogData.length === 0) {
        return <SvgNotice Component={UndrawNoData} title={"This Changelog Is Empty"}/>
    }
    return changelogData.map(element => {
        return <UiCol xs={12} className={"mt-4"} key={element.tag.name}>
            <UiViewBoxBackground>
                <h1>{element.title}</h1>
                <MarkdownContainer text={element.description}/>
            </UiViewBoxBackground>
        </UiCol>
    });
};

export default BoardChangelogBox;