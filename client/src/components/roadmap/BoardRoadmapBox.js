import styled from "@emotion/styled";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {SvgNotice} from "components/commons/SvgNotice";
import {SimpleIdeaCard} from "components/roadmap/SimpleIdeaCard";
import React from "react";
import tinycolor from "tinycolor2";
import {UiBadge} from "ui";
import {UiCol} from "ui/grid";
import {UiViewBoxBackground} from "ui/viewbox/UiViewBox";

const RoadmapContainer = styled.div`
  padding: 0 1rem;
  min-height: 310px;
  max-height: 310px;
  overflow: auto;
  scrollbar-width: thin; /* firefox property */
  &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
    background: hsl(0, 0%, 94%);
  }
  
  .dark {
    scrollbar-color: var(--dark-hover) var(--dark-tertiary); /* firefox property */
    &::-webkit-scrollbar {
      background: var(--dark-tertiary);
    }
    &::-webkit-scrollbar-thumb {
      background: var(--dark-hover);
    }
  }
`;

const StyledTagName = styled(UiBadge)`
  font-size: 1.25rem;
  padding: .25rem .75rem;
`;

export const BoardRoadmapBox = ({roadmapData}) => {
    if (roadmapData.length === 0) {
        return <SvgNotice Component={UndrawNoData} title={"This Roadmap Is Empty"}/>
    }
    return roadmapData.map(element => {
        return <UiCol xs={12} md={6} lg={4} className={"mt-4"} key={element.tag.name}>
            <h3>
                <StyledTagName color={tinycolor(element.tag.color)}>{element.tag.name}</StyledTagName>
                <div className={"float-right"}>
                    <UiBadge style={{fontSize: "1rem"}} className={"align-middle"} color={tinycolor(element.tag.color)}>{element.ideas.data.length}</UiBadge>
                </div>
            </h3>
            <UiViewBoxBackground as={RoadmapContainer}>
                {element.ideas.data.map(idea => {
                    return <SimpleIdeaCard key={idea.id} ideaData={idea}/>
                })}
            </UiViewBoxBackground>
        </UiCol>
    });
};