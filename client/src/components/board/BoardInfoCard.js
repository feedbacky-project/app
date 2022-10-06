import styled from "@emotion/styled";
import IdeaCreateModal from "components/board/IdeaCreateModal";
import MarkdownContainer from "components/commons/MarkdownContainer";
import {AppContext, BoardContext} from "context";
import React, {useContext, useEffect, useState} from 'react';
import {useHotkeys} from "react-hotkeys-hook";
import {FaAlignRight, FaPencilAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import {UiCard, UiHorizontalRule} from "ui";
import {UiButton, UiLoadableButton} from "ui/button";
import {UiCol} from "ui/grid";

export const BoardDescription = styled(MarkdownContainer)`
    color: var(--font-color) !important;
`;

const BoardInfoCard = ({onIdeaCreation, setSearchQuery}) => {
    const {user, loginIntent, setIntent, onIntentComplete} = useContext(AppContext);
    const {data, onNotLoggedClick} = useContext(BoardContext);
    const [open, setOpen] = useState(false);
    useHotkeys("c", e => {
       e.preventDefault();
       setOpen(true);
    });
    useEffect(() => {
        if(loginIntent === "IDEA_CREATE" && user.loggedIn) {
            setOpen(true);
            onIntentComplete();
        }
    }, [loginIntent, user]);

    const onCreateIdeaModalClick = () => {
        if (!user.loggedIn) {
            onNotLoggedClick();
            setIntent("IDEA_CREATE");
            return Promise.resolve();
        }
        setOpen(true);
        return Promise.resolve();
    };
    const renderEditButton = () => {
        const contains = data.moderators.find(mod => mod.userId === user.data.id && (mod.role === "ADMINISTRATOR" || mod.role === "OWNER"));
        if (!contains) {
            return;
        }
        return <UiButton label={"Edit Board"} as={Link} to={{pathname: "/ba/" + data.discriminator, state: {_boardData: data}}} className={"py-1 float-right"}>
            Manage <FaAlignRight className={"ml-1 move-top-1px"}/>
        </UiButton>
    };
    return <UiCol xs={{span: 12, order: 1}} lg={{span: 4, order: 12}}>
        <IdeaCreateModal isOpen={open} onHide={() => setOpen(false)} onIdeaCreation={onIdeaCreation} setSearchQuery={setSearchQuery}/>
        <UiCard className={"my-2 text-left"}>
            <BoardDescription text={data.fullDescription}/>
            <UiHorizontalRule className={"pb-1"}/>
            {/* eslint-disable-next-line */}
            <UiLoadableButton label={"Create Idea"} tabIndex={1} className={"py-1"} onClick={onCreateIdeaModalClick}>
                <FaPencilAlt className={"mr-1 move-top-1px"}/> New Idea
            </UiLoadableButton>
            {renderEditButton()}
        </UiCard>
    </UiCol>
};

export default BoardInfoCard;