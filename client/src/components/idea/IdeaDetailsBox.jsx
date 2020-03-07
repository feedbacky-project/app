import React, {Component} from 'react';
import Button from "react-bootstrap/Button";
import {Badge, Col} from "react-bootstrap";
import {FaFrown, FaLock, FaRegEdit, FaTrash} from "react-icons/fa";
import Image from "react-bootstrap/Image";
import TimeAgo from "timeago-react";
import axios from "axios";
import AppContext from "../../context/AppContext";
import Spinner from "react-bootstrap/Spinner";
import {formatUsername, getSimpleRequestConfig, getSizedAvatarByUrl, htmlDecode, increaseBrightness, isHexDark, toastError, toastSuccess} from "../util/Utils";
import ModeratorActions from "../board/ModeratorActions";
import snarkdown from "../util/snarkdown";
import {IoIosClose} from "react-icons/io";
import {popupSwal} from "../util/SwalUtils";
import {FiChevronsUp, FiChevronUp} from "react-icons/fi";
import TextareaAutosize from "react-autosize-textarea";

class IdeaDetailsBox extends Component {

    static contextType = AppContext;

    justVoted = false;

    state = {
        data: [],
        loaded: false,
        error: false,
        editorMode: false,
        editorValue: htmlDecode(this.props.ideaData.description),
    };

    componentDidMount() {
        axios.get(this.context.apiRoute + "/ideas/" + this.props.ideaData.id + "/voters", getSimpleRequestConfig(this.context.user.session))
            .then(res => {
                if (res.status !== 200) {
                    this.setState({error: true});
                }
                const data = res.data;
                this.setState({data, loaded: true});
            }).catch(() => {
            this.setState({error: true})
        });
    }

    render() {
        return <React.Fragment>
            <Col sm="12" md="10" className="mt-4">
                <Col xs="12" className="d-inline-flex mb-2 p-0">
                    <div className="my-auto mr-2">
                        {this.renderButton()}
                    </div>
                    <div>
                        {this.renderLockState()}
                        {this.renderDetails()}
                    </div>
                </Col>
                <Col xs="12" className="p-0">
                    {this.renderDescription()}
                </Col>
            </Col>
            <Col md="2" xs="12">
                <React.Fragment>
                    <div className="mt-4 text-black-75">Voters ({this.props.ideaData.votersAmount} votes)</div>
                    {this.renderVoters()}
                </React.Fragment>
                {this.renderTags()}
                {this.renderAttachments()}
            </Col>
        </React.Fragment>
    }

    renderButton() {
        let color = this.context.theme;
        if (this.context.user.darkMode && isHexDark(color)) {
            color = increaseBrightness(color, 40);
        }
        let vote;
        if (!this.props.ideaData.upvoted) {
            color += "99";
            vote = <FiChevronUp style={{color}}/>;
        } else {
            vote = <FiChevronsUp style={{color}}/>;
        }
        let classes = "grey-text font-weight-bold vote-button z-depth-0 px-2 py-1 m-0";
        if (this.justVoted) {
            classes += " animated pulse on-vote";
        }
        return <span className="my-auto">
            <Button className={classes}
                    style={{lineHeight: '16px', minWidth: 35, minHeight: 45, fontSize: 15}} onClick={this.onUpvote} variant="">
                {vote}
                <span className="d-block bg-transparent" style={{color: color}}>{this.props.ideaData.votersAmount}</span>
        </Button>
        </span>
    }

    renderLockState() {
        if (this.props.ideaData.open) {
            return;
        }
        return <FaLock className="fa-sm mr-1" style={{transform: "translateY(-5px)"}}/>
    }


    renderDetails() {
        return <React.Fragment>
            <span className="mr-1" style={{fontSize: "1.45rem", letterSpacing: "-.3pt"}} dangerouslySetInnerHTML={{__html: this.props.ideaData.title}}/>
            <ModeratorActions moderators={this.props.moderators} ideaData={this.props.ideaData} onStateChange={this.props.onStateChange}
                              onTagsUpdate={this.props.onTagsUpdate} onIdeaDelete={this.onIdeaDelete}/>
            {this.renderDeletionButton()}
            {this.renderEditButton()}
            <br/>
            <Image roundedCircle className="mr-1" src={getSizedAvatarByUrl(this.props.ideaData.user.avatar, 32)}
                   width={18} height={18} style={{maxWidth: "none"}} onError={(e) => e.target.src = "https://cdn.feedbacky.net/static/img/default_avatar.png"}/>
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
        return <FaRegEdit className="ml-1 fa-sm cursor-click move-top-2px" onClick={this.onEditorToggle}/>
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
            <span className="markdown-box" style={{wordBreak: "break-word"}} dangerouslySetInnerHTML={{__html: snarkdown(this.props.ideaData.description)}}/>
        </React.Fragment>
    }

    renderAttachments() {
        if (this.state.editorMode || this.props.ideaData.attachments.length === 0) {
            return <React.Fragment/>
        }
        //todo lightbox for attachments
        return <React.Fragment>
            <div className="my-1 text-black-75">Attached Files</div>
            {this.props.ideaData.attachments.map((attachment, i) => {
                let userId = this.context.user.data.id;
                if (this.props.ideaData.user.id === userId || this.props.moderators.find(mod => mod.userId === userId)) {
                    return <React.Fragment key={"attachment" + i}>
                        <IoIosClose className="grey lighten-2 black-text rounded-circle" onClick={() => this.onAttachmentDelete(attachment)} style={{position: "absolute", transform: "translate(-5px, -5px)"}}/>
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <img width={125} className="img-thumbnail" alt="attachment" src={attachment.url} key={"attachment_" + i}/>
                        </a>
                    </React.Fragment>
                }
                return <a href={attachment.url} target="_blank" rel="noopener noreferrer" key={"attachment_" + i}>
                    <img width={125} className="img-thumbnail" alt="attachment" src={attachment.url}/>
                </a>
            })}
        </React.Fragment>
    }

    renderEditorMode() {
        return <React.Fragment>
            <TextareaAutosize className="form-control bg-lighter" id="editorBox" rows={1} maxRows={12} placeholder="Write a description..." required as="textarea"
                              style={{resize: "none", overflow: "hidden"}} defaultValue={htmlDecode(this.state.editorValue)}/>
            <Button className="m-0 mt-2 btn-smaller text-white" variant="" style={{backgroundColor: this.context.theme}} onClick={this.onEditApply}>Save</Button>
            <Button className="m-0 mt-2 btn-smaller text-black-50" variant="link" onClick={this.onEditorToggle}>Cancel</Button>
        </React.Fragment>
    }

    renderVoters() {
        if (!this.state.loaded) {
            const voters = this.props.ideaData.votersAmount > 5 ? 5 : this.props.ideaData.votersAmount;
            let spinners = [];
            for (let i = 0; i < voters; i++) {
                spinners.push(<Spinner key={"spinner_" + i} animation="grow" variant="" className="merged" style={{verticalAlign: "text-bottom", margin: "0 -10px 0 0", width: 23, height: 23, color: this.context.theme}}/>);
            }
            if (this.props.ideaData.votersAmount <= 5) {
                return <React.Fragment>{spinners}</React.Fragment>
            }
            return <React.Fragment>
                {spinners} <span className="d-inline-block" style={{marginLeft: 10, fontSize: 13, letterSpacing: "-.2pt", transform: "translateY(-4px)"}}> + {this.props.ideaData.votersAmount - 5} more</span>
            </React.Fragment>
        }
        if (this.state.error) {
            return <div className="text-danger"><FaFrown className="fa-sm"/> Failed to load</div>
        }
        return <div>
            {this.state.data.slice(0, 5).map(data => {
                return <Image roundedCircle key={"voter_" + data.id} alt="avatar" className="merged" src={getSizedAvatarByUrl(data.avatar, 32)} width={25} height={25}
                              onError={(e) => e.target.src = "https://cdn.feedbacky.net/static/img/default_avatar.png"}/>
            })}
            {this.renderAndMore()}
        </div>
    }

    renderAndMore() {
        if (this.state.data.length <= 5) {
            return;
        }
        return <span className="d-inline" style={{marginLeft: 10, fontSize: 13, letterSpacing: "-.2pt"}}> + {this.state.data.length - 5} more</span>
    }

    renderTags() {
        if (this.props.ideaData.tags.length === 0) {
            return;
        }
        return <React.Fragment>
            <div className="mt-1 text-black-75">Tags</div>
            {this.props.ideaData.tags.map(data => {
                let color = data.color;
                if (this.context.user.darkMode) {
                    color += "BF";
                }
                return <Badge key={"badge_" + data.name} variant="" className="mr-1" style={{backgroundColor: color}}>{data.name}</Badge>
            })}
        </React.Fragment>
    }

    onAttachmentDelete = (attachment) => {
        popupSwal("warning", "Dangerous action", "This attachment will be permanently removed.",
            "Delete", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/attachments/" + attachment.id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    this.props.onAttachmentDelete(attachment.url);
                    toastSuccess("Attachment removed.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

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
            url: this.context.apiRoute + "/ideas/" + this.props.ideaData.id + "/voters",
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
                this.setState({data: this.state.data.concat(this.context.user.data)});
            } else {
                this.setState({data: this.state.data.filter(item => item.id !== this.context.user.data.id)});
            }
            this.props.onStateUpdate(upvoted, votersAmount);
        }).catch(() => {
            toastError();
        });
    };

    onIdeaDelete = () => {
        this.props.history.push("/b/" + this.props.ideaData.boardDiscriminator);
    };

    onEditorToggle = () => {
        this.setState({editorMode: !this.state.editorMode});
    };

    onEditApply = () => {
        let description = document.getElementById("editorBox").value;
        axios.patch(this.context.apiRoute + "/ideas/" + this.props.ideaData.id, {
            description: description
        }, getSimpleRequestConfig(this.context.user.session)).then(res => {
            if (res.status !== 200) {
                toastError();
                return;
            }
            this.setState({editorMode: false});
            this.props.onIdeaEdit(description);
            toastSuccess("Idea edited.");
        }).catch(err => {
            toastError(err.response.data.errors[0]);
        })
    };

    onDelete = () => {
        popupSwal("warning", "Dangerous action", "This action is <strong>irreversible</strong> and will delete the idea, please confirm your action.",
            "Delete Idea", "#d33", willClose => {
                if (!willClose.value) {
                    return;
                }
                axios.delete(this.context.apiRoute + "/ideas/" + this.props.ideaData.id, getSimpleRequestConfig(this.context.user.session)).then(res => {
                    if (res.status !== 204) {
                        toastError();
                        return;
                    }
                    this.props.history.push("/b/" + this.props.ideaData.boardDiscriminator);
                    toastSuccess("Idea permanently deleted.");
                }).catch(err => {
                    toastError(err.response.data.errors[0]);
                })
            });
    };

}

export default IdeaDetailsBox;