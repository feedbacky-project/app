import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";
import axios from "axios";
import BoardInfoCard from "components/board/BoardInfoCard";
import BoardChangelogInfoCard from "components/changelog/BoardChangelogInfoCard";
import MarkdownContainer from "components/commons/MarkdownContainer";
import {SvgNotice} from "components/commons/SvgNotice";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext, useEffect, useState} from "react";
import {FaRegFrown} from "react-icons/all";
import InfiniteScroll from "react-infinite-scroll-component";
import TimeAgo from "timeago-react/esm/timeago-react";
import {UiLoadingSpinner, UiPrettyUsername} from "ui";
import {UiCol} from "ui/grid";
import {UiAvatar} from "ui/image";
import {UiViewBoxBackground} from "ui/viewbox/UiViewBox";
import {prepareFilterAndSortRequests} from "utils/basic-utils";

const BoardChangelogBox = () => {
    const {user} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const [changelog, setChangelog] = useState({data: [], loaded: false, error: false, moreToLoad: true});
    const [page, setPage] = useState(0);
    useEffect(() => {
        onLoadRequest(true);
        // eslint-disable-next-line
    }, [user.session, user.localPreferences.changelog]);
    const onLoadRequest = (override = false) => {
        const currentPage = override ? 0 : page;
        return axios.get("/boards/" + boardData.discriminator + "/changelog?page=" + currentPage + prepareFilterAndSortRequests(user.localPreferences.changelog)).then(res => {
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
    const loadChangelogs = () => {
        if (changelog.error) {
            return <SvgNotice Component={UndrawNoIdeas} title={<React.Fragment><FaRegFrown className={"mr-1"}/> Failed to load changelog</React.Fragment>}/>
        }
        if (changelog.loaded && changelog.data.length === 0 && !changelog.moreToLoad) {
            return <SvgNotice Component={UndrawNoData} title={"This Changelog Is Empty"}/>
        }
        console.log(changelog.data);
        return <InfiniteScroll
            style={{overflow: "initial"}}
            next={onLoadRequest}
            hasMore={changelog.moreToLoad}
            dataLength={changelog.data.length}
            loader={<UiCol className={"text-center mt-5 pt-5"}><UiLoadingSpinner/></UiCol>}>
            {changelog.data.map(element => {
                return <UiCol xs={12} className={"my-2 px-0"} key={element.id}>
                    <UiViewBoxBackground className={"d-inline-block p-4"}>
                        <div style={{fontSize: "1.35em", fontWeight: "bold"}}>{element.title}</div>
                        <MarkdownContainer text={element.description}/>
                        <small className={"text-black-60 mt-2 float-left"}>
                            Published {" "}
                            <TimeAgo datetime={element.creationDate}/>
                        </small>
                        <small className={"text-black-60 mt-2 float-right"}>
                            By <UiPrettyUsername user={element.creator}/> {" "}
                            <UiAvatar size={16} user={element.creator} className={"align-top"} roundedCircle/>
                        </small>
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