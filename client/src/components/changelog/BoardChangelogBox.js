import {ReactComponent as UndrawNetworkError} from "assets/svg/undraw/network_error.svg";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";
import axios from "axios";
import BoardChangelogInfoCard from "components/changelog/BoardChangelogInfoCard";
import BoardChangelogTitle from "components/changelog/BoardChangelogTitle";
import MarkdownContainer from "components/commons/MarkdownContainer";
import {SvgNotice} from "components/commons/SvgNotice";
import {AppContext, BoardContext} from "context";
import React, {useContext, useEffect, useState} from "react";
import {FaRegFrown} from "react-icons/all";
import InfiniteScroll from "react-infinite-scroll-component";
import TimeAgo from "timeago-react/esm/timeago-react";
import {UiLoadingSpinner, UiPrettyUsername} from "ui";
import {UiButton} from "ui/button";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiViewBoxBackground} from "ui/viewbox/UiViewBox";
import {prepareFilterAndSortRequests} from "utils/basic-utils";

const BoardChangelogBox = ({searchQuery}) => {
    const {user} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const [changelog, setChangelog] = useState({data: [], loaded: false, error: false, moreToLoad: true});
    const [page, setPage] = useState(0);
    useEffect(() => {
        onLoadRequest(true);
        // eslint-disable-next-line
    }, [user.session, searchQuery, user.localPreferences.changelog]);
    const onLoadRequest = (override = false) => {
        const withQuery = searchQuery === "" ? "" : "&query=" + searchQuery;
        const currentPage = override ? 0 : page;
        return axios.get("/boards/" + boardData.discriminator + "/changelog?page=" + currentPage + prepareFilterAndSortRequests(user.localPreferences.changelog) + withQuery).then(res => {
            const data = res.data.data;
            if (override) {
                setChangelog({...changelog, data, loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages});
            } else {
                setChangelog({...changelog, data: changelog.data.concat(data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages});
            }
            setPage(currentPage + 1);
        }).catch(() => setChangelog({...changelog, error: true}));
    };
    const onChangelogCreation = (data) => {
        setChangelog({...changelog, data: [data, ...changelog.data]});
    };
    const onChangelogUpdate = (data) => {
        const newChangelogs = [...changelog.data];
        const index = newChangelogs.findIndex(c => c.id === data.id);
        newChangelogs[index] = data;
        setChangelog({...changelog, data: newChangelogs});
    };
    const onChangelogDelete = (data) => {
      let newData = changelog.data;
      newData = newData.filter(changelog => changelog.id !== data.id);
      setChangelog({...changelog, data: newData});
    };
    const loadChangelogs = () => {
        if (changelog.error) {
            return <div className={"text-center"}>
                <SvgNotice Component={UndrawNetworkError} title={"Network Error"} description={"Failed to load changelog"}/>
                <UiButton className={"mt-1"} label={"Reload"} small onClick={() => onLoadRequest(true)}>Reload</UiButton>
            </div>
        }
        if (changelog.loaded && changelog.data.length === 0 && !changelog.moreToLoad) {
            if (searchQuery !== "") {
                return <SvgNotice Component={UndrawNoIdeas} title={"No changelogs for query '" + searchQuery + "'."}/>
            }
            return <SvgNotice Component={UndrawNoData} title={"This Changelog Is Empty"}/>
        }
        return <InfiniteScroll
            style={{overflow: "initial"}}
            next={onLoadRequest}
            hasMore={changelog.moreToLoad}
            dataLength={changelog.data.length}
            loader={<UiCol className={"text-center mt-5 pt-5"}><UiLoadingSpinner/></UiCol>}>
            {changelog.data.map(element => {
                return <UiCol xs={12} className={"my-2 px-0"} key={element.id}>
                    <UiViewBoxBackground className={"d-inline-block p-4"}>
                        <BoardChangelogTitle data={element} onChangelogDelete={onChangelogDelete} onChangelogUpdate={onChangelogUpdate}/>
                        <MarkdownContainer className={"my-2"} text={element.description}/>
                    </UiViewBoxBackground>
                </UiCol>
            })}
        </InfiniteScroll>
    };
    return <React.Fragment>
        <UiCol xs={{order: 12}} lg={{span: 8, order: 1}}>
            {loadChangelogs()}
        </UiCol>
        <BoardChangelogInfoCard onChangelogCreation={onChangelogCreation}/>
    </React.Fragment>
};

export default BoardChangelogBox;