import {CardLinkStyle, IdeaCardDescription, InfoContainer} from "components/board/IdeaCard";
import VoteButton from "components/commons/VoteButton";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext, useEffect, useState} from "react";
import {FaLock, FaRegComment} from "react-icons/all";
import {Link, useHistory, useLocation} from "react-router-dom";
import {UiClassicIcon} from "ui";
import {UiRow} from "ui/grid";
import {convertIdeaToSlug, truncateText} from "utils/basic-utils";

export const SimpleIdeaCard = ({ideaData}) => {
    const cardRef = React.createRef();
    const history = useHistory();
    const location = useLocation();
    const {data} = useContext(BoardContext);
    const [idea, setIdea] = useState(ideaData);
    useEffect(() => setIdea(ideaData), [ideaData]);
    const renderLockState = () => {
        if (idea.open) {
            return;
        }
        return <UiClassicIcon as={FaLock} className={"mr-1 move-top-2px"}/>
    };
    const renderComments = () => {
        if (idea.commentsAmount > 0) {
            return <InfoContainer>
                {idea.commentsAmount}
                <FaRegComment className={"ml-1 move-top-2px"}/>
            </InfoContainer>
        }
    };
    return <IdeaContext.Provider value={{
        ideaData: idea, loaded: true, error: false,
        updateState: data => {
            setIdea(data);
            history.replace({pathname: location.pathname, state: null});
        },
    }}>
        <div ref={cardRef} id={"ideac_" + idea.id} className={"m-3"}>
            <UiRow>
                <span className={"my-auto mr-2"}>
                    <VoteButton idea={idea} animationRef={cardRef} onVote={(upvoted, votersAmount) => setIdea({...idea, upvoted, votersAmount})}/>
                </span>
                <CardLinkStyle as={Link} className={"d-inline text-left"} to={{pathname: "/i/" + convertIdeaToSlug(idea), state: {_ideaData: idea, _boardData: data}}}>
                    <div>
                        <div className={"d-inline mr-1"} style={{letterSpacing: `-.15pt`}}>
                            {renderLockState()}
                            <span dangerouslySetInnerHTML={{__html: idea.title}}/>
                            {renderComments()}
                        </div>
                    </div>
                    <IdeaCardDescription dangerouslySetInnerHTML={{__html: truncateText(idea.description, 85)}}/>
                </CardLinkStyle>
            </UiRow>
        </div>
    </IdeaContext.Provider>
};