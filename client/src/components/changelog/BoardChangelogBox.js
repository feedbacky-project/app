import styled from "@emotion/styled";
import {ReactComponent as UndrawNetworkError} from "assets/svg/undraw/network_error.svg";
import {ReactComponent as UndrawNoData} from "assets/svg/undraw/no_data.svg";
import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";
import axios from "axios";
import BoardChangelogInfoCard from "components/changelog/BoardChangelogInfoCard";
import BoardChangelogTitle from "components/changelog/BoardChangelogTitle";
import MarkdownContainer from "components/commons/MarkdownContainer";
import ReactionsBox from "components/commons/ReactionsBox";
import {SvgNotice} from "components/commons/SvgNotice";
import {ShareBox} from "components/idea/ShareBox";
import {AppContext, BoardContext} from "context";
import qs from "querystringify";
import React, {useContext, useEffect, useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {useLocation} from "react-router-dom";
import {UiLoadingSpinner, UiThemeContext} from "ui";
import {UiButton} from "ui/button";
import {UiCol} from "ui/grid";
import {UiViewBoxBackground} from "ui/viewbox/UiViewBox";
import {popupWarning, prepareFilterAndSortRequests, scrollIntoView} from "utils/basic-utils";

const ShareBoxOverlay = styled.div`
  display: inline-block;
  float: right;
  border-radius: var(--border-radius);
  border: 1px dashed ${props => props.theme};
`;

const BoardChangelogBox = ({searchQuery}) => {
    const {user, loginIntent, setIntent, onIntentComplete} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {data: boardData, onNotLoggedClick} = useContext(BoardContext);
    const [changelog, setChangelog] = useState({data: [], loaded: false, error: false, moreToLoad: true});
    const [page, setPage] = useState(0);
    const location = useLocation();
    const [scrollTo, setScrollTo] = useState(null);
    useEffect(() => {
        onLoadRequest(true).then(() => {
            const qsData = qs.parse(location.search);
            if (qsData.changelogId == null) {
                return;
            }
            setScrollTo(qsData.changelogId);
        });
        // eslint-disable-next-line
    }, [user.session, searchQuery, user.localPreferences.changelog]);
    useEffect(() => {
        if (scrollTo == null) {
            return;
        }
        setTimeout(function () {
            scrollIntoView("changelogc_" + scrollTo).then(() => setScrollTo(null));
        }, 500);
    }, [scrollTo]);
    useEffect(() => {
        if(loginIntent !== null && loginIntent.includes("CHANGELOG_REACT") && user.loggedIn) {
            const intentData = loginIntent.split(";");
            const changelogId = intentData[1];
            const reactionId = intentData[2];
            onChangelogReact(changelogId, reactionId);
            onIntentComplete();
        }
    }, [loginIntent, user]);

    const onLoadRequest = (override = false) => {
        const withQuery = searchQuery === "" ? "" : "&query=" + searchQuery;
        const currentPage = override ? 0 : page;
        return axios.get("/boards/" + boardData.discriminator + "/changelogs?page=" + currentPage + prepareFilterAndSortRequests(user.localPreferences.changelog) + withQuery).then(res => {
            const data = res.data.data;
            if (override) {
                setChangelog({...changelog, data, loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, error: false});
            } else {
                setChangelog({...changelog, data: changelog.data.concat(data), loaded: true, moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages, error: false});
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
    const onChangelogReact = (changelogId, reactionId) => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            setIntent("CHANGELOG_REACT;" + changelogId + ";" + reactionId);
            return Promise.resolve();
        }
        return axios.post("/changelogs/" + changelogId + "/reactions", {reactionId}).then(res => {
            if (res.status !== 200) {
                popupWarning("Failed to add reaction");
                return;
            }
            setChangelog({
                ...changelog, data: changelog.data.map(element => {
                    if (element.id === changelogId) {
                        element.reactions.push(res.data);
                    }
                    return element;
                })
            });
        });
    };
    const onChangelogUnreact = (changelogId, reactionId) => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            return Promise.resolve();
        }
        return axios.delete("/changelogs/" + changelogId + "/reactions/" + reactionId).then(res => {
            if (res.status !== 204) {
                popupWarning("Failed to remove reaction");
                return;
            }
            setChangelog({
                ...changelog, data: changelog.data.map(element => {
                    if (element.id === changelogId) {
                        const reaction = element.reactions.find(r => r.user.id === user.data.id && r.reactionId === reactionId);
                        element.reactions = element.reactions.filter(r => r !== reaction);
                    }
                    return element;
                })
            });
        });
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
                return <UiCol xs={12} className={"my-2 px-0"} key={element.id} id={"changelogc_" + element.id}>
                    <UiViewBoxBackground className={"d-inline-block p-4"}>
                        <BoardChangelogTitle data={element} onChangelogDelete={onChangelogDelete} onChangelogUpdate={onChangelogUpdate}/>
                        <MarkdownContainer className={"my-2"} text={element.description}/>
                        <div className={"d-flex"}>
                            <ReactionsBox className={"d-inline-block my-auto"} parentObjectId={element.id} reactionsData={element.reactions} onReact={onChangelogReact} onUnreact={onChangelogUnreact}/>
                            <ShareBoxOverlay className={"ml-auto"} theme={getTheme().setAlpha(.2).toString()}>
                                <ShareBox locationHref={window.location.href + "?changelogId=" + element.id} bodyClassName={"p-1"}/>
                            </ShareBoxOverlay>
                        </div>
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