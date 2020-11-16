import React, {useContext, useEffect, useRef, useState} from 'react';
import IdeaCard from "components/board/ideas/idea-card";
import axios from 'axios';
import {Col} from "react-bootstrap";
import {FaRegFrown} from "react-icons/fa";
import LoadingSpinner from "components/util/loading-spinner";
import AppContext from "context/app-context";
import BoardDetailsBox from "components/board/board-details-box";
import InfiniteScroll from 'react-infinite-scroller';
import {prepareFilterAndSortRequests} from "components/util/utils";
import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";
import {SvgNotice} from "components/app/svg-notice";

const BoardContainer = ({id, onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const [ideas, setIdeas] = useState({data: [], loaded: false, error: false, moreToLoad: true});
    const [scrollTo, setScrollTo] = useState(null);
    const isInitialMount = useRef(true);
    useEffect(() => {
        if(isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            onLoadRequest(1, true);
        }
        // eslint-disable-next-line
    }, [id, context.user.localPreferences]);
    const loadIdeas = () => {
        if (ideas.error) {
            return <SvgNotice Component={UndrawNoIdeas} title={<React.Fragment><FaRegFrown className="mr-1"/> Failed to load ideas</React.Fragment>}/>
        }
        if (ideas.loaded && ideas.data.length === 0 && !ideas.moreToLoad) {
            return <SvgNotice Component={UndrawNoIdeas} title="No ideas yet." description="How about creating one?"/>
        }
        return <InfiniteScroll
            pageStart={0}
            loadMore={(page) => onLoadRequest(page)}
            hasMore={ideas.moreToLoad}
            loader={<LoadingSpinner key={ideas.data.length}/>}>
            {ideas.data.map(ideaData => {
                return <IdeaCard key={ideaData.id} data={ideaData} onIdeaDelete={onIdeaDelete} onNotLoggedClick={onNotLoggedClick}/>
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
    const onLoadRequest = (page, override = false) => {
        return axios.get("/boards/" + id + "/ideas?page=" + (page - 1) + prepareFilterAndSortRequests(context.user.localPreferences.ideas)).then(res => {
            const data = res.data.data;
            data.forEach(element => element.tags.sort((a, b) => a.name.localeCompare(b.name)));
            if(override) {
                setIdeas({...ideas, data, loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages});
            } else {
                setIdeas({...ideas, data: ideas.data.concat(data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages});
            }
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
