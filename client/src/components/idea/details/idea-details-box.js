import React, {Component} from 'react';
import Button from "react-bootstrap/Button";
import {Col} from "react-bootstrap";
import {FaLock, FaTrash} from "react-icons/fa";
import Image from "react-bootstrap/Image";
import TimeAgo from "timeago-react";
import axios from "axios";
import AppContext from "context/app-context";
import {formatUsername, getSizedAvatarByUrl, htmlDecode, parseMarkdown, toastError, toastSuccess} from "components/util/utils";
import ModeratorActions from "components/board/moderator-actions";
import {popupSwal} from "components/util/sweetalert-utils";
import TextareaAutosize from "react-autosize-textarea";
import {FaPen} from "react-icons/all";
import VotersComponent from "components/idea/details/voters-component";
import TagsComponent from "components/idea/details/tags-component";
import AttachmentsComponent from "components/idea/details/attachments-component";
import MailSubscriptionComponent from "components/idea/details/mail-subscription-component";
import VoteButton from "components/app/vote-button";

class IdeaDetailsBox extends Component {

    static contextType = AppContext;

    justVoted = false;

    state = {
        voters: {data: [], loaded: false, error: false},
        editorMode: false,
        editorValue: htmlDecode(this.props.ideaData.description),
    };

    componentDidMount() {
        axios.get("/ideas/" + this.props.ideaData.id + "/voters").then(res => {
            if (res.status !== 200) {
                this.setState({
                    voters: {...this.state.voters, error: true}
                });
            }
            const data = res.data;
            this.setState({
                voters: {...this.state.voters, data, loaded: true}
            });
        }).catch(() => {
            this.setState({
                voters: {...this.state.voters, error: true}
            });
        });
    }

    render() {
        return <React.Fragment>
            <Col sm={12} md={10} className="mt-4">
                <Col xs={12} className="d-inline-flex mb-2 p-0">
                    <div className="my-auto mr-2">
                        <VoteButton votersAmount={this.props.ideaData.votersAmount} onVote={this.onUpvote} upvoted={this.props.ideaData.upvoted} justVoted={this.justVoted}/>
                    </div>
                    <div>
                        {this.renderLockState()}
                        {this.renderDetails()}
                    </div>
                </Col>
                <Col xs={12} className="p-0">
                    {this.renderDescription()}
                </Col>
            </Col>
            <Col md={2} xs={12}>
                <VotersComponent votersAmount={this.props.ideaData.votersAmount} data={this.state.voters}/>
                <TagsComponent data={this.props.ideaData.tags}/>
                <AttachmentsComponent ideaData={this.props.ideaData} moderators={this.props.moderators} updateState={this.props.updateState}/>
                <MailSubscriptionComponent ideaData={this.props.ideaData} updateState={this.props.updateState} onNotLoggedClick={this.props.onNotLoggedClick}/>
            </Col>
        </React.Fragment>
    }

    renderLockState() {
        if (this.props.ideaData.open) {
            return;
        }
        return <FaLock className="mr-1" style={{transform: "translateY(-4px)"}}/>
    }


    renderDetails() {
        return <React.Fragment>
            <span className="mr-1 text-tight" style={{fontSize: "1.45rem"}}
                  dangerouslySetInnerHTML={{__html: this.props.ideaData.title}}/>
            <ModeratorActions moderators={this.props.moderators} ideaData={this.props.ideaData}
                              updateState={this.props.updateState}/>
            {this.renderDeletionButton()}
            {this.renderEditButton()}
            <br/>
            <Image roundedCircle className="mr-1" src={getSizedAvatarByUrl(this.props.ideaData.user.avatar, 32)}
                   width={18} height={18} style={{maxWidth: "none"}}
                   onError={(e) => e.target.src = process.env.REACT_APP_DEFAULT_USER_AVATAR}/>
            <small>{formatUsername(this.props.ideaData.user.id, this.props.ideaData.user.username, this.props.moderators)} ·{" "}</small>
            <small className="text-black-60"><TimeAgo datetime={this.props.ideaData.creationDate}/></small>
            {this.renderEditedNote()}
        </React.Fragment>
    }

    renderDeletionButton() {
        //if moderator, then moderator actions can handle that
        if (this.props.ideaData.user.id !== this.context.user.data.id || this.props.moderators.find(mod => mod.userId === this.context.user.data.id)) {
            return;
        }
        return <FaTrash className="ml-1 fa-xs cursor-click move-top-2px" onClick={this.onDelete}/>
    }

    renderEditButton() {
        if (this.props.ideaData.user.id !== this.context.user.data.id) {
            return;
        }
        return <FaPen className="ml-2 fa-xs cursor-click move-top-2px text-black-60" onClick={this.onEditorToggle}/>
    }

    renderEditedNote() {
        if (!this.props.ideaData.edited) {
            return;
        }
        return <small className="text-black-60"> · edited</small>
    }

    renderDescription() {
        if (this.state.editorMode) {
            return this.renderEditorMode();
        }
        return <React.Fragment>
            <span className="markdown-box" dangerouslySetInnerHTML={{__html: parseMarkdown(this.props.ideaData.description)}}/>
        </React.Fragment>
    }

    renderEditorMode() {
        return <React.Fragment>
            <TextareaAutosize className="form-control bg-lighter" id="editorBox" rows={1} maxRows={12}
                              placeholder="Write a description..." required as="textarea"
                              style={{resize: "none", overflow: "hidden"}}
                              defaultValue={htmlDecode(this.state.editorValue)}/>
            <Button className="m-0 mt-2" variant="" style={{backgroundColor: this.context.getTheme()}}
                    onClick={this.onEditApply}>Save</Button>
            <Button className="m-0 mt-2 text-black-50" variant="link" onClick={this.onEditorToggle}>Cancel</Button>
        </React.Fragment>
    }

    onUpvote = () => {
        if (!this.context.user.loggedIn) {
            this.props.onNotLoggedClick();
            return;
        }
        let request;
        let upvoted;
        let votersAmount;
        if (this.props.ideaData.upvoted) {
            request = "DELETE";
            upvoted = false;
            votersAmount = this.props.ideaData.votersAmount - 1;
        } else {
            request = "POST";
            upvoted = true;
            votersAmount = this.props.ideaData.votersAmount + 1;
        }
        axios({
            method: request,
            url: "/ideas/" + this.props.ideaData.id + "/voters",
            headers: {
                "Authorization": "Bearer " + this.context.user.session
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 204) {
                toastError();
                return;
            }
            this.justVoted = upvoted;
            if (upvoted) {
                this.setState({
                    voters: {...this.state.voters, data: this.state.voters.data.concat(this.context.user.data)}
                });
            } else {
                this.setState({
                    voters: {...this.state.voters, data: this.state.voters.data.filter(item => item.id !== this.context.user.data.id)}
                });
            }
            this.props.updateState({
                ...this.props.ideaData, upvoted, votersAmount
            });
        }).catch(() => toastError());
    };

    onEditorToggle = () => {
        this.setState({editorMode: !this.state.editorMode});
    };

    onEditApply = () => {
        let description = document.getElementById("editorBox").value;
        axios.patch("/ideas/" + this.props.ideaData.id, {
            description
        }).then(res => {
            if (res.status !== 200) {
                toastError();
                return;
            }
            this.setState({editorMode: false, editedValue: htmlDecode(description)});
            this.props.updateState({
                ...this.props.ideaData, description, edited: true
            });
            toastSuccess("Idea edited.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    onDelete = () => {
        popupSwal("warning", "Dangerous action", "This action is <strong>irreversible</strong> and will delete the idea, please confirm your action.",
            "Delete Idea", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete("/ideas/" + this.props.ideaData.id).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    this.props.history.push("/b/" + this.props.ideaData.boardDiscriminator);
                    toastSuccess("Idea permanently deleted.");
                }).catch(err => toastError(err.response.data.errors[0]));
            });
    };

}

export default IdeaDetailsBox;