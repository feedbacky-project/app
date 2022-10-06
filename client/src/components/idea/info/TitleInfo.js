import {IdeaCardTitle} from "components/board/IdeaCard";
import ModeratorActionsButton from "components/commons/ModeratorActionsButton";
import {AppContext, BoardContext, IdeaContext} from "context";
import React, {useContext} from "react";
import {FaLock, FaPen, FaThumbtack, FaTrash} from "react-icons/fa";
import TimeAgo from "timeago-react";
import {UiHoverableIcon, UiPrettyUsername} from "ui";
import {UiFormControl} from "ui/form";
import {UiAvatar} from "ui/image";

const TitleInfo = ({setModal, editor, setEditor, onStateChange}) => {
    const {ideaData} = useContext(IdeaContext);
    const {data} = useContext(BoardContext);
    const {user} = useContext(AppContext);

    const renderDeletionButton = () => {
        //if moderator, then moderator actions component can handle that
        if (ideaData.user.id !== user.data.id || data.moderators.find(mod => mod.userId === user.data.id)) {
            return;
        }
        return <UiHoverableIcon as={FaTrash} className={"text-black-60 ml-1 d-inline-block my-auto"} onClick={() => setModal({open: true})}/>
    };
    const renderTitleEditor = () => {
        //within 15 minutes (in millis)
        let titleEditable = new Date() - new Date(ideaData.creationDate) <= 900000;
        if (editor.enabled && titleEditable) {
            return <UiFormControl id={"titleEditorBox"} rows={1} maxRows={1} placeholder={"Write a title..."}
                                  required label={"Write a title"} onChange={e => setEditor({...editor, titleValue: e.target.value})}
                                  style={{display: "inline-block", resize: "none", overflow: "hidden", width: "80%"}} defaultValue={editor.titleValue}/>
        }
        return <IdeaCardTitle style={{fontSize: "1.4rem"}} dangerouslySetInnerHTML={{__html: ideaData.title}}/>
    }
    return <div className={"w-75"}>
        <div className={"w-100"}>
            {ideaData.open || <FaLock className={"mr-1 my-auto"} style={{transform: "translateY(-3px)"}}/>}
            {!ideaData.pinned || <FaThumbtack className={"mr-1 my-auto"} style={{transform: "translateY(-3px) rotate(30deg)"}}/>}
            {renderTitleEditor()}
            <div className={"d-inline-block"}>
                <ModeratorActionsButton onStateChange={onStateChange}/>
                {renderDeletionButton()}
                {ideaData.user.id !== user.data.id || <UiHoverableIcon as={FaPen} className={"text-black-60 ml-1 move-top-2px"} onClick={() => setEditor({...editor, enabled: !editor.enabled})}/>}
            </div>
        </div>
        <UiAvatar roundedCircle className={"mr-1"} user={ideaData.user} size={18} style={{maxWidth: "none"}}/>
        <small><UiPrettyUsername user={ideaData.user}/> ·{" "}</small>
        <small className={"text-black-60"}><TimeAgo datetime={ideaData.creationDate}/></small>
        {!ideaData.edited || <small className={"text-black-60"}> · edited</small>}
    </div>
};

export default TitleInfo;