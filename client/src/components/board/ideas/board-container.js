import React, {useContext, useEffect, useState} from 'react';
import IdeaBox from "./idea-box";
import axios from 'axios';
import {Col} from "react-bootstrap";
import {FaRegFrown} from "react-icons/fa";
import LoadingSpinner from "components/util/loading-spinner";
import AppContext from "context/app-context";
import BoardDetailsBox from "components/board/board-details-box";
import InfiniteScroll from 'react-infinite-scroller';
import {prepareFilterAndSortRequests} from "components/util/utils";
import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";
import BoardContext from "context/board-context";

const BoardContainer = ({id, onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const boardContext = useContext(BoardContext);
    const [ideas, setIdeas] = useState({data: [], loaded: false, error: false, moreToLoad: true});
    const [scrollTo, setScrollTo] = useState(null);
    const loadIdeas = () => {
        if (ideas.error) {
            return <div className="text-center mt-3">
                <UndrawNoIdeas style={{maxWidth: 150, maxHeight: 120, color: context.getTheme()}}/>
                <div>
                    <strong><FaRegFrown className="mr-1"/> Failed to load ideas</strong>
                </div>
            </div>
        }
        if (ideas.loaded && ideas.data.length === 0 && !ideas.moreToLoad) {
            return <div className="text-center mt-3">
                <UndrawNoIdeas style={{maxWidth: 150, maxHeight: 120, color: context.getTheme()}}/>
                <div>
                    <strong style={{fontSize: "1.1rem"}}>No ideas yet.</strong>
                    <br/>
                    <span className="text-black-60">How about creating one?</span>
                </div>
            </div>
        }
        return <InfiniteScroll
            pageStart={0}
            loadMore={(page) => onLoadRequest(page)}
            hasMore={ideas.moreToLoad}
            loader={<LoadingSpinner key={ideas.data.length}/>}>
            {ideas.data.map(ideaData => {
                return <IdeaBox key={ideaData.id} data={ideaData} onIdeaDelete={onIdeaDelete} boardData={boardContext.data} onNotLoggedClick={onNotLoggedClick}/>
            })}
        </InfiniteScroll>
    };
    const onIdeaCreation = (data) => {
        setIdeas({...ideas, data: ideas.data.concat(data)});
        setScrollTo(data.id);
    };
    const onIdeaDelete = (id) => {
        setIdeas({...ideas, data: ideas.data.filter(item => item.id !== id)});
    };
    const onLoadRequest = (page) => {
        return axios.get("/boards/" + id + "/ideas?page=" + (page - 1) + prepareFilterAndSortRequests(context.user.searchPreferences)).then(res => {
            const data = res.data.data;
            data.forEach(element => element.tags.sort((a, b) => a.name.localeCompare(b.name)));
            setIdeas({...ideas, data: ideas.data.concat(data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages});
        }).catch(() => setIdeas({...ideas, error: true}));
    };
    useEffect(() => {
        if (scrollTo == null) {
            return;
        }
        setTimeout(function () {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
            setTimeout(function () {
                document.getElementById("container_idea_" + scrollTo).classList.add("upvote-animation");
                setScrollTo(null);
            }, 200);
        }, 500);
    }, [scrollTo]);

    return <React.Fragment>
        <Col lg={8} className="order-lg-1 order-12">
            {loadIdeas()}
        </Col>
        <BoardDetailsBox onIdeaCreation={onIdeaCreation} onNotLoggedClick={onNotLoggedClick}/>
    </React.Fragment>
};

export default BoardContainer;
