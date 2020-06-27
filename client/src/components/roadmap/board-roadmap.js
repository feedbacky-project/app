import React, {useContext} from "react";
import {Col} from "react-bootstrap";
import BoardContext from "context/board-context";
import BoardBanner from "components/board/board-banner";
import {SimpleIdeaCard} from "components/roadmap/simple-idea-card";
import {SvgNotice} from "components/app/svg-notice";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";

export const BoardRoadmap = ({data, onNotLoggedClick}) => {
    const boardData = useContext(BoardContext).data;
    const renderRoadmap = () => {
        if (data.length === 0) {
            return <SvgNotice Component={UndrawNoData} title="This Roadmap Is Empty"/>
        }
        return data.map(element => {
            return <Col className="mt-4 roadmap-col" key={element.tag.name}>
                <h3>
                    <strong style={{color: element.tag.color}}>{element.tag.name}</strong>
                </h3>
                <div className="view-box-bg px-3 mx-0 rounded shadow roadmap-container py-1">
                    {element.ideas.data.map(idea => {
                        return <SimpleIdeaCard key={idea.id} onNotLoggedClick={onNotLoggedClick} data={idea}/>
                    })}
                </div>
            </Col>
        });
    };
    return <React.Fragment>
        <BoardBanner customName={<React.Fragment>
            {boardData.name} - Roadmap
        </React.Fragment>}/>
        {renderRoadmap()}
    </React.Fragment>
};