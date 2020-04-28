import React, {Component} from 'react';
import IdeaBox from "../idea-box";
import axios from 'axios';
import {Col, Row} from "react-bootstrap";
import ErrorIdeaBox from "../error-idea-box";
import {FaRegFrown} from "react-icons/fa";
import LoadingSpinner from "../../../util/loading-spinner";
import AppContext from "../../../../context/app-context";
import BoardDetailsBox from "../../board-details-box";
import InfiniteScroll from 'react-infinite-scroller';
import {getSimpleRequestConfig, prepareFilterAndSortRequests} from "../../../util/utils";
import {ReactSVG} from "react-svg";

//fixme
class BoardContainer extends Component {

    static contextType = AppContext;

    state = {
        initialLoaded: false,
        error: false,
        ideas: [],
        scrollTo: null,
        moreToLoad: true,
    };

    render() {
        return <React.Fragment>
            <Col lg={8} className="order-lg-1 order-12">
                {this.loadIdeas()}
            </Col>
            <BoardDetailsBox onIdeaCreation={this.onIdeaCreation} description={this.props.boardData.fullDescription} moderators={this.props.moderators} discriminator={this.props.boardData.discriminator}
                             license={this.props.boardData.license} boardData={this.props.boardData} onNotLoggedClick={this.props.onNotLoggedClick}/>
        </React.Fragment>
    }

    onIdeaCreation = (data) => {
        this.setState({
            ideas: this.state.ideas.concat(data),
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
                document.getElementById("container_idea_" + self.state.scrollTo).classList.add("animated", "pulse", "on-vote");
                self.setState({scrollTo: null});
            }, 200);
        }, 500);
    }

    onIdeaDelete = (id) => {
        this.setState({
            ideas: this.state.ideas.filter(item => item.id !== id)
        });
    };

    loadIdeas() {
        if (this.state.error) {
            return <ErrorIdeaBox>
                <FaRegFrown className="mr-1"/> Failed to load ideas
            </ErrorIdeaBox>
        }
        if (this.state.initialLoaded && this.state.ideas.length === 0 && !this.state.moreToLoad) {
            return <div className="text-center mt-3">
                <ReactSVG src="https://cdn.feedbacky.net/static/svg/undraw_no_ideas.svg"
                          beforeInjection={svg => {
                              svg.setAttribute('style', 'max-width: 150px; max-height: 120px; color: ' + this.context.theme);
                          }}/>
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
            hasMore={this.state.moreToLoad}
            loader={<Row className="justify-content-center my-5" key={"loader_" + this.state.ideas.length}><LoadingSpinner/></Row>}>
            {this.state.ideas.map(ideaData => {
                return <IdeaBox key={ideaData.id} data={ideaData} onIdeaDelete={this.onIdeaDelete} boardData={this.props.boardData}
                                moderators={this.props.moderators} onNotLoggedClick={this.props.onNotLoggedClick}/>
            })}
        </InfiniteScroll>
    }

    onLoadRequest = (page) => {
        return axios.get(this.context.apiRoute + "/boards/" + this.props.id + "/ideas?page=" + (page - 1) + prepareFilterAndSortRequests(this.context.user.searchPreferences),
            getSimpleRequestConfig(this.context.user.session))
            .then(res => {
                const ideas = res.data.data;
                ideas.forEach(element => element.tags.sort((a, b) => a.name.localeCompare(b.name)));
                this.setState({ideas: this.state.ideas.concat(ideas), moreToLoad: res.data.pageMetadata.currentPage !== res.data.pageMetadata.pages, initialLoaded: true});
            }).catch(() => {
                this.setState({error: true});
            });
    }

}

export default BoardContainer;
