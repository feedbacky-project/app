import styled from "@emotion/styled";
import {CardLinkStyle, IdeaCardDescription, IdeaCardTitle, InfoContainer, PinIcon} from "components/board/IdeaCard";
import MarkdownContainer from "components/commons/MarkdownContainer";
import VoteButton from "components/commons/VoteButton";
import {BoardContext, IdeaContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaLock, FaRegComment} from "react-icons/fa";
import {Link, useHistory, useLocation} from "react-router-dom";
import {UiClassicIcon} from "ui";
import {UiRow} from "ui/grid";
import {convertIdeaToSlug} from "utils/basic-utils";

const SimpleCardTitle = styled.div`
  display: inline;
  margin-right: .25em;
  letter-spacing: -.15pt;
`;

const SimpleIdeaCard = ({ideaData}) => {
    const cardRef = React.createRef();
    const history = useHistory();
    const location = useLocation();
    const {data} = useContext(BoardContext);
    const [idea, setIdea] = useState(ideaData);
    useEffect(() => setIdea(ideaData), [ideaData]);

    const renderComments = () => {
        if (idea.commentsAmount > 0) {
            return <InfoContainer>
                {idea.commentsAmount}
                <FaRegComment className={"ml-1 move-top-2px"}/>
            </InfoContainer>
        }
    };
    const updateState = data => {
        setIdea(data);
        history.replace({pathname: location.pathname, state: null});
    };
    const onVote = (upvoted, votersAmount) => setIdea({...idea, upvoted, votersAmount});
    return <IdeaContext.Provider value={{ideaData: idea, loaded: true, error: false, updateState: updateState}}>
        <div ref={cardRef} id={"ideac_" + idea.id} className={"m-3"}>
            <UiRow>
                <span className={"my-auto mr-2"}><VoteButton idea={idea} animationRef={cardRef} onVote={onVote}/></span>
                <CardLinkStyle as={Link} className={"d-inline text-left"} to={{pathname: "/i/" + convertIdeaToSlug(idea), state: {_ideaData: idea, _boardData: data}}}>
                    <div>
                        <SimpleCardTitle>
                            {idea.open || <UiClassicIcon as={FaLock} className={"mr-1 move-top-2px"}/>}
                            {!idea.pinned || <UiClassicIcon as={PinIcon} className={"mr-1"}/>}
                            <IdeaCardTitle dangerouslySetInnerHTML={{__html: idea.title}}/>
                            {renderComments()}
                        </SimpleCardTitle>
                    </div>
                    <MarkdownContainer as={IdeaCardDescription} text={idea.description} truncate={85} stripped/>
                </CardLinkStyle>
            </UiRow>
        </div>
    </IdeaContext.Provider>
};

export default SimpleIdeaCard;