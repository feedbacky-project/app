import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";
import axios from 'axios';
import BoardInfoCard from "components/board/BoardInfoCard";
import IdeaCard from "components/board/IdeaCard";
import {SvgNotice} from "components/commons/SvgNotice";
import AppContext from "context/AppContext";
import React, {useContext, useEffect, useRef, useState} from 'react';
import {FaRegFrown} from "react-icons/fa";
import InfiniteScroll from 'react-infinite-scroller';
import {UiLoadingSpinner} from "ui";
import {UiCol} from "ui/grid";
import {prepareFilterAndSortRequests} from "utils/basic-utils";

const BoardIdeaCardContainer = ({id, searchQuery}) => {
    const {user} = useContext(AppContext);
    const [ideas, setIdeas] = useState({data: [], loaded: false, error: false, moreToLoad: true});
    const [scrollTo, setScrollTo] = useState(null);
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setIdeas({...ideas, loaded: false});
            onLoadRequest(1, true);
        }
        // eslint-disable-next-line
    }, [id, searchQuery, user.localPreferences]);
    const loadIdeas = () => {
        if (ideas.error) {
            return <SvgNotice Component={UndrawNoIdeas} title={<React.Fragment><FaRegFrown className={"mr-1"}/> Failed to load ideas</React.Fragment>}/>
        }
        if (ideas.loaded && ideas.data.length === 0 && !ideas.moreToLoad) {
            if (searchQuery !== "") {
                return <SvgNotice Component={UndrawNoIdeas} title={"No ideas for query '" + searchQuery + "'."}/>
            }
            return <SvgNotice Component={UndrawNoIdeas} title={"No ideas yet."} description={"How about creating one?"}/>
        }
        return <InfiniteScroll
            pageStart={0}
            loadMore={page => onLoadRequest(page)}
            hasMore={ideas.moreToLoad}
            loader={<UiCol className={"text-center mt-5 pt-5"} key={ideas.data.length}><UiLoadingSpinner/></UiCol>}>
            {ideas.data.map(ideaData => {
                return <IdeaCard key={ideaData.id} ideaData={ideaData} onIdeaDelete={onIdeaDelete}/>
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
        const withQuery = searchQuery === "" ? "" : "&query=" + searchQuery;
        return axios.get("/boards/" + id + "/ideas?page=" + (page - 1) + prepareFilterAndSortRequests(user.localPreferences.ideas) + withQuery).then(res => {
            const data = res.data.data;
            data.forEach(element => element.tags.sort((a, b) => a.name.localeCompare(b.name)));
            if (override) {
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
                document.getElementById("ideac_" + scrollTo).classList.add("upvote-animation");
                setScrollTo(null);
            }, 200);
        }, 500);
    }, [scrollTo]);

    return <React.Fragment>
        <UiCol xs={{order: 12}} lg={{span: 8, order: 1}}>
            {loadIdeas()}
        </UiCol>
        <BoardInfoCard onIdeaCreation={onIdeaCreation}/>
    </React.Fragment>
};

export default BoardIdeaCardContainer;
