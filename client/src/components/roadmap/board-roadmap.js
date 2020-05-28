import React, {useContext} from "react";
import {Badge, Col} from "react-bootstrap";
import BoardContext from "context/board-context";
import BoardBanner from "components/board/board-banner";
import AppContext from "context/app-context";
import {SimpleIdeaCard} from "components/roadmap/simple-idea-card";

export const BoardRoadmap = ({data, onNotLoggedClick}) => {
    const boardData = useContext(BoardContext).data;
    const context = useContext(AppContext);
    const renderRoadmap = () => data.map(element => {
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
    return <React.Fragment>
        <BoardBanner customName={<React.Fragment>
            {boardData.name} - Roadmap
            <Badge className="ml-2 move-top-3px" variant="" style={{backgroundColor: context.getTheme()}}>Beta</Badge>
        </React.Fragment>}/>
        {renderRoadmap()}
    </React.Fragment>
};