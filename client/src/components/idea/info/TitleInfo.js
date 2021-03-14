import ModeratorActionsButton from "components/commons/ModeratorActionsButton";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import IdeaContext from "context/IdeaContext";
import React, {useContext} from "react";
import {FaLock, FaPen, FaTrash} from "react-icons/all";
import TimeAgo from "timeago-react";
import {UiHoverableIcon, UiPrettyUsername} from "ui";
import {UiAvatar} from "ui/image";

const TitleInfo = ({setModal, editor, setEditor}) => {
    const {ideaData} = useContext(IdeaContext);
    const {data} = useContext(BoardContext);
    const {user} = useContext(AppContext);
    const renderDeletionButton = () => {
        //if moderator, then moderator actions component can handle that
        if (ideaData.user.id !== user.data.id || data.moderators.find(mod => mod.userId === user.data.id)) {
            return;
        }
        return <UiHoverableIcon as={FaTrash} className={"move-top-2px text-black-60 ml-1"} onClick={() => setModal({open: true})}/>
    };
    return <div>
        {ideaData.open || <FaLock className={"mr-1"} style={{transform: "translateY(-4px)"}}/>}
        <span style={{fontSize: "1.4rem"}} dangerouslySetInnerHTML={{__html: ideaData.title}}/>
        <ModeratorActionsButton/>
        {renderDeletionButton()}
        {ideaData.user.id !== user.data.id || <UiHoverableIcon as={FaPen} className={"move-top-2px text-black-60 ml-1"} onClick={() => setEditor({...editor, enabled: !editor.enabled})}/>}
        <br/>
        <UiAvatar roundedCircle className={"mr-1"} user={ideaData.user} size={18} style={{maxWidth: "none"}}/>
        <small><UiPrettyUsername user={ideaData.user}/> ·{" "}</small>
        <small className={"text-black-60"}><TimeAgo datetime={ideaData.creationDate}/></small>
        {!ideaData.edited || <small className={"text-black-60"}> · edited</small>}
    </div>
};

export default TitleInfo;