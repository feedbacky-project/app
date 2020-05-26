import React, {Component} from 'react';
import {Button, Col, OverlayTrigger, Tooltip} from "react-bootstrap";
import axios from "axios";
import {FaExclamation, FaTrashAlt} from "react-icons/fa";
import {toastError, toastSuccess} from "components/util/utils";
import AppContext from "context/app-context";
import TagCreateModal from "components/modal/tag-create-modal";
import AdminSidebar from "components/sidebar/admin-sidebar";
import {popupSwal} from "components/util/sweetalert-utils";
import ClickableTip from "components/util/clickable-tip";
import ViewBox from "components/viewbox/view-box";
import PageBadge from "components/app/page-badge";
import tinycolor from "tinycolor2";
import ComponentLoader from "components/app/component-loader";

class TagsSettings extends Component {

    static contextType = AppContext;

    state = {
        tags: [],
        loaded: false,
        error: false,
        quotaReached: false,
        tagCreatorModalOpened: false,
    };

    componentDidMount() {
        axios.get("/boards/" + this.props.data.discriminator + "/tags").then(res => {
            if (res.status !== 200) {
                this.setState({error: true});
                return;
            }
            const tags = res.data;
            let quotaReached = this.quotaTagsLimitReached(tags);
            this.setState({tags, loaded: true, quotaReached});
        }).catch(() => this.setState({error: true}));
    }

    quotaTagsLimitReached(tags) {
        return 10 - tags.length <= 0;
    }

    onTagCreateModalClick = () => {
        this.setState({tagCreatorModalOpened: true});
    };

    onTagCreateModalClose = () => {
        this.setState({tagCreatorModalOpened: false});
    };

    onTagCreate = (name, color) => {
        const tags = this.state.tags.concat({name, color});
        this.setState({
            tags, quotaReached: this.quotaTagsLimitReached(tags)
        });
    };

    render() {
        return <React.Fragment>
            <AdminSidebar currentNode="tags" reRouteTo={this.props.reRouteTo} data={this.props.data}/>
            <TagCreateModal onTagCreate={this.onTagCreate} onTagCreateModalClose={this.onTagCreateModalClose}
                            data={this.props.data} open={this.state.tagCreatorModalOpened}/>
            <Col xs={12} md={9}>
                <ViewBox theme={this.context.getTheme()} title="Tags Management" description="Edit your board tags here.">
                    {this.renderContent()}
                </ViewBox>
            </Col>
        </React.Fragment>
    }

    renderContent() {
        if (this.state.error) {
            return <span className="text-danger">Failed to obtain tags data</span>
        }
        return <ComponentLoader loaded={this.state.loaded} component={
            <Col xs={12}>
                <span className="mr-1 text-black-60">Tags Quota ({this.renderTagsQuota()} left)</span>
                <ClickableTip id="quota" title="Tags Quota" description="Amount of tags your board can have, you're limited to 10 tags per board."/>
                {this.renderTags()}
                <br/>
                {this.renderNewTagButton()}
            </Col>
        }/>
    }

    renderTagsQuota() {
        return 10 - this.state.tags.length;
    }

    renderTags() {
        return this.state.tags.map((tag, i) => {
            return <div key={i}>
                <PageBadge color={tinycolor(tag.color)} text={tag.name}/>
                <OverlayTrigger overlay={<Tooltip id={"deleteTag" + i + "-tooltip"}>Delete Tag</Tooltip>}>
                    <FaTrashAlt className="fa-xs ml-1" onClick={() => this.onTagDelete(tag.name)}/>
                </OverlayTrigger>
            </div>
        });
    }

    renderNewTagButton() {
        if (this.state.quotaReached) {
            return <OverlayTrigger overlay={<Tooltip id="quota-tooltip">Quota Limit Reached</Tooltip>}>
                <Button className="m-0 mt-3 float-right" variant=""
                        style={{backgroundColor: this.context.getTheme()}}><FaExclamation/> Add new Tag</Button>
            </OverlayTrigger>
        }
        return <Button className="m-0 mt-3 float-right" variant="" style={{backgroundColor: this.context.getTheme()}}
                       onClick={this.onTagCreateModalClick}>Add new Tag</Button>
    }

    onTagDelete = (name) => {
        popupSwal("warning", "Dangerous action", "This action is <strong>irreversible</strong> and will delete tag from all ideas, please confirm your action.",
            "Delete Tag", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/boards/" + this.props.data.discriminator + "/tags/" + name).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    const tags = this.state.tags.filter(item => item.name !== name);
                    this.setState({
                        tags, quotaReached: this.quotaTagsLimitReached(tags)
                    });
                    toastSuccess("Tag permanently deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };
}

export default TagsSettings;