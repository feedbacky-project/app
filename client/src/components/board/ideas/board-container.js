import React, {Component} from 'react';
import IdeaBox from "./idea-box";
import axios from 'axios';
import {Col, Row} from "react-bootstrap";
import {FaRegFrown} from "react-icons/fa";
import LoadingSpinner from "components/util/loading-spinner";
import AppContext from "context/app-context";
import BoardDetailsBox from "components/board/board-details-box";
import InfiniteScroll from 'react-infinite-scroller';
import {prepareFilterAndSortRequests} from "components/util/utils";
import {ReactComponent as UndrawNoIdeas} from "assets/svg/undraw/no_ideas.svg";

//fixme
class BoardContainer extends Component {

    static contextType = AppContext;

    state = {
        ideas: {data: [], loaded: false, error: false, moreToLoad: true},
        scrollTo: null,
    };

    render() {
        return <React.Fragment>
            <Col lg={8} className="order-lg-1 order-12">
                {this.loadIdeas()}
            </Col>
            <BoardDetailsBox onIdeaCreation={this.onIdeaCreation} description={this.props.boardData.fullDescription} moderators={this.props.moderators}
                             discriminator={this.props.boardData.discriminator} boardData={this.props.boardData} onNotLoggedClick={this.props.onNotLoggedClick}/>
        </React.Fragment>
    }

    onIdeaCreation = (data) => {
        this.setState({
            ideas: {...this.state.ideas, data: this.state.ideas.data.concat(data)},
            scrollTo: data.id,
        });
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.scrollTo == null) {
            return;
        }
        let self = this;
        setTimeout(function () {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
            setTimeout(function () {
                document.getElementById("container_idea_" + self.state.scrollTo).classList.add("upvote-animation");
                self.setState({scrollTo: null});
            }, 200);
        }, 500);
    }

    onIdeaDelete = (id) => {
        this.setState({
            ideas: {...this.state.ideas, data: this.state.ideas.data.filter(item => item.id !== id)}
        });
    };

    loadIdeas() {
        if (this.state.ideas.error) {
            return <div className="text-center mt-3">
                <UndrawNoIdeas style={{maxWidth: 150, maxHeight: 120, color: this.context.getTheme()}}/>
                <div>
                    <strong><FaRegFrown className="mr-1"/> Failed to load ideas</strong>
                </div>
            </div>
        }
        if (this.state.ideas.loaded && this.state.ideas.data.length === 0 && !this.state.ideas.moreToLoad) {
            return <div className="text-center mt-3">
                <UndrawNoIdeas style={{maxWidth: 150, maxHeight: 120, color: this.context.getTheme()}}/>
                <div>
                    <strong style={{fontSize: "1.1rem"}}>No ideas yet.</strong>
                    <br/>
                    <span className="text-black-60">How about creating one?</span>
                </div>
            </div>
        }
        return <InfiniteScroll
            pageStart={0}
            loadMore={(page) => this.onLoadRequest(page)}
            hasMore={this.state.ideas.moreToLoad}
            loader={<Row className="justify-content-center my-5" key={this.state.ideas.data.length}><LoadingSpinner/></Row>}>
            {this.state.ideas.data.map(ideaData => {
                return <IdeaBox key={ideaData.id} data={ideaData} onIdeaDelete={this.onIdeaDelete} boardData={this.props.boardData}
                                moderators={this.props.moderators} onNotLoggedClick={this.props.onNotLoggedClick}/>
            })}
        </InfiniteScroll>
    }

    onLoadRequest = (page) => {
        this.setState({ideas: {...this.state.ideas, moreToLoad: false}});
        return axios.get("/boards/" + this.props.id + "/ideas?page=" + (page - 1) + prepareFilterAndSortRequests(this.context.user.searchPreferences)).then(res => {
            const ideas = res.data.data;
            ideas.forEach(element => element.tags.sort((a, b) => a.name.localeCompare(b.name)));
            this.setState({
                ideas: {
                    ...this.state.ideas,
                    data: this.state.ideas.data.concat(ideas),
                    loaded: true,
                    moreToLoad: res.data.pageMetadata.currentPage < res.data.pageMetadata.pages
                }
            });
        }).catch(() => this.setState({
            ideas: {...this.state.ideas, error: true}
        }));
    }

}

export default BoardContainer;
