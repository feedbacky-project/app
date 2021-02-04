import styled from "@emotion/styled";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {SvgNotice} from "components/commons/SvgNotice";
import {SimpleIdeaCard} from "components/roadmap/SimpleIdeaCard";
import React from "react";
import {UiCol} from "ui/grid";
import {UiViewBoxBackground} from "ui/viewbox/UiViewBox";

const RoadmapContainer = styled.div`
  padding: 0 1rem;
  min-height: 310px;
  max-height: 310px;
  overflow: auto;
  scrollbar-width: thin; /* firefox property */
  background-color: white;
  border-radius: .35rem;
  box-shadow: var(--box-shadow);
  &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
    background: hsl(0, 0%, 94%);
  }
  
  .dark {
    background-color: var(--dark-secondary);
    box-shadow: var(--dark-box-shadow);

    scrollbar-color: var(--dark-hover) var(--dark-tertiary); /* firefox property */
    &::-webkit-scrollbar {
      background: var(--dark-tertiary);
    }
    &::-webkit-scrollbar-thumb {
      background: var(--dark-hover);
    }
  }
`;

export const BoardRoadmapBox = ({roadmapData}) => {
    if (roadmapData.length === 0) {
        return <SvgNotice Component={UndrawNoData} title={"This Roadmap Is Empty"}/>
    }
    return roadmapData.map(element => {
        return <UiCol xs={12} md={6} lg={4} className={"mt-4"} key={element.tag.name}>
            <h3>
                <strong style={{color: element.tag.color}}>{element.tag.name}</strong>
            </h3>
            <UiViewBoxBackground as={RoadmapContainer}>
                {element.ideas.data.map(idea => {
                    return <SimpleIdeaCard key={idea.id} ideaData={idea}/>
                })}
            </UiViewBoxBackground>
        </UiCol>
    });
};