import styled from "@emotion/styled";
import SafeAnchor from "components/commons/SafeAnchor";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import copy from "copy-text-to-clipboard";
import React, {useContext} from "react";
import {FaFacebookSquare, FaLink, FaTwitterSquare} from "react-icons/all";
import {UiCard, UiTooltip} from "ui";
import {popupNotification} from "utils/basic-utils";

const ShareRelativeContainer = styled.div`
  @media(min-width: 768px) {
    height: 30px;
    margin-top: .75rem;
  }
`;

const ShareAbsoluteContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin-right: .9rem;
`;

const ShareIcon = styled.div`
  margin-left: .25rem;
  margin-right: .25rem;
  height: 1rem;
  width: 1rem;
  cursor: pointer;
  color: var(--font-color);
  
  &:hover {
    color: ${props => props.theme};
    transition: var(--hover-transition);
    transform: var(--hover-transform-scale-lg);
  }
`;

const ShareBox = () => {
    const {getTheme} = useContext(AppContext);
    const {data} = useContext(BoardContext);

    const copyLink = () => {
        copy(window.location.href + "?source=share");
        popupNotification("Copied to clipboard", getTheme());
    };
    return <ShareRelativeContainer>
        <ShareAbsoluteContainer>
            <UiCard bodyClassName={"px-2 py-1"}>
                <SafeAnchor url={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(window.location.href + "?source=share")}>
                    <UiTooltip id={"share-facebook"} text={"Share on Facebook"}>
                        <ShareIcon as={FaFacebookSquare} theme={getTheme().toHexString()}/>
                    </UiTooltip>
                </SafeAnchor>
                <SafeAnchor url={"https://twitter.com/intent/tweet?url=" + encodeURI(window.location.href + "?source=share") + "&text=Check%20this%20idea%20at%20" + encodeURI(data.name)}>
                    <UiTooltip id={"share-twitter"} text={"Share on Twitter"}>
                        <ShareIcon as={FaTwitterSquare} theme={getTheme().toHexString()}/>
                    </UiTooltip>
                </SafeAnchor>
                <UiTooltip id={"share-link"} text={"Share Link"}>
                    <ShareIcon as={FaLink} theme={getTheme().toHexString()} onClick={copyLink}/>
                </UiTooltip>
            </UiCard>
        </ShareAbsoluteContainer>
    </ShareRelativeContainer>
};

export default ShareBox;