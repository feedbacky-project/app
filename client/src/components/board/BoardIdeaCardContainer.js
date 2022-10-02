import {ReactComponent as UndrawNetworkError} from "assets/svg/undraw/network_error.svg";
import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";
import axios from 'axios';
import BoardInfoCard from "components/board/BoardInfoCard";
import IdeaCard from "components/board/IdeaCard";
import {SvgNotice} from "components/commons/SvgNotice";
import {AppContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import {UiLoadingSpinner} from "ui";
import {UiButton} from "ui/button";
import {UiCol} from "ui/grid";
import {prepareFilterAndSortRequests, scrollIntoView} from "utils/basic-utils";

const BoardIdeaCardContainer = ({id, searchQuery, setSearchQuery}) => {
    const {user} = useContext(AppContext);
    const [ideas, setIdeas] = useState({data: [], loaded: false, error: false, moreToLoad: true});
    const [scrollTo, setScrollTo] = useState(null);
    const [page, setPage] = useState(0);
    useEffect(() => {
        onLoadRequest(true);
        // eslint-disable-next-line
    }, [id, searchQuery, user.session, user.localPreferences.ideas]);
    useEffect(() => {
        if (scrollTo == null) {
            return;
        }
        setTimeout(function () {
            scrollIntoView("ideac_" + scrollTo).then(() => setScrollTo(null));
        }, 500);
    }, [scrollTo]);

    const loadIdeas = () => {
        if (ideas.error) {
            return <div className={"text-center"}>
                <SvgNotice Component={UndrawNetworkError} title={"Network Error"} description={"Failed to load ideas"}/>
                <UiButton className={"mt-1"} label={"Reload"} small onClick={() => onLoadRequest(true)}>Reload</UiButton>
            </div>
        }
        if (ideas.loaded && ideas.data.length === 0 && !ideas.moreToLoad) {
            if (searchQuery !== "") {
                return <SvgNotice Component={UndrawNoIdeas} title={"No ideas for query '" + searchQuery + "'."}/>
            }
            return <SvgNotice Component={UndrawNoIdeas} title={"No ideas yet."} description={"How about creating one?"}/>
        }
        return <InfiniteScroll
            style={{overflow: "initial"}}
            next={onLoadRequest}
            hasMore={ideas.moreToLoad}
            dataLength={ideas.data.length}
            loader={<UiCol className={"text-center mt-5 pt-5"}><UiLoadingSpinner/></UiCol>}>
            {ideas.data.map(ideaData => {
                return <IdeaCard key={ideaData.id} ideaData={ideaData} onIdeaDelete={onIdeaDelete}/>
            })}
        </InfiniteScroll>
    };
    const onIdeaCreation = (data) => {
        let index = 0;
        ideas.data.forEach(i => {
            if(i.pinned) {
                index++;
            }
        });
        //splice does modify already but we need to update state as well
        ideas.data.splice(index, 0, data);
        setIdeas({...ideas, data: ideas.data});
        setScrollTo(data.id);
    };
    const onIdeaDelete = (id) => {
        setIdeas({...ideas, data: ideas.data.filter(item => item.id !== id)});
    };
    const onLoadRequest = (override = false) => {
        const currentPage = override ? 0 : page;
        return axios.get("/boards/" + id + "/ideas?page=" + currentPage + prepareFilterAndSortRequests(user.localPreferences.ideas, searchQuery)).then(res => {
            const data = res.data.data;
            data.forEach(element => element.tags.sort((a, b) => a.name.localeCompare(b.name)));
            if (override) {
                setIdeas({...ideas, data, loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, error: false});
            } else {
                setIdeas({...ideas, data: ideas.data.concat(data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, error: false});
            }
            setPage(currentPage + 1);
        }).catch(() => setIdeas({...ideas, error: true}));
    };

    return <React.Fragment>
        <UiCol xs={{order: 12}} lg={{span: 8, order: 1}}>
            {loadIdeas()}
        </UiCol>
        <BoardInfoCard onIdeaCreation={onIdeaCreation} setSearchQuery={setSearchQuery}/>
    </React.Fragment>
};

export default BoardIdeaCardContainer;
