import styled from "@emotion/styled";
import SafeAnchor from "components/commons/SafeAnchor";
import {BoardContext} from "context";
import copy from "copy-text-to-clipboard";
import React, {useContext} from "react";
import {FaFacebookSquare, FaLink, FaTwitterSquare} from "react-icons/fa";
import {UiCard, UiThemeContext, UiTooltip} from "ui";
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
  transform: translateY(-1px);
  
  &:hover {
    color: ${props => props.theme};
    transition: var(--hover-transition);
  }
`;

const ShareBox = ({locationHref = window.location.href, bodyClassName = null}) => {
    const {getTheme} = useContext(UiThemeContext);
    const {data} = useContext(BoardContext);

    //workaround for already set query values
    const shareHref = () => {
        if(locationHref.includes("?")) {
            return locationHref + "&source=share";
        }
        return locationHref + "?source=share";
    }
    const copyLink = () => {
        copy(shareHref());
        popupNotification("Copied to clipboard", getTheme());
    };
    return <UiCard bodyClassName={bodyClassName || "px-2 py-1"}>
        <SafeAnchor url={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(shareHref())}>
            <UiTooltip id={"share-facebook"} text={"Share on Facebook"}>
                <ShareIcon as={FaFacebookSquare} theme={getTheme().toHexString()}/>
            </UiTooltip>
        </SafeAnchor>
        <SafeAnchor url={"https://twitter.com/intent/tweet?url=" + encodeURI(shareHref()) + "&text=Check%20this%20out%20at%20" + encodeURI(data.name)}>
            <UiTooltip id={"share-twitter"} text={"Share on Twitter"}>
                <ShareIcon as={FaTwitterSquare} theme={getTheme().toHexString()}/>
            </UiTooltip>
        </SafeAnchor>
        <UiTooltip id={"share-link"} text={"Share Link"}>
            <ShareIcon as={FaLink} theme={getTheme().toHexString()} onClick={copyLink}/>
        </UiTooltip>
    </UiCard>
};

const ShareBoxAlignment = ({children}) => {
    return <ShareRelativeContainer>
        <ShareAbsoluteContainer>
            {children}
        </ShareAbsoluteContainer>
    </ShareRelativeContainer>
};

export {ShareBox, ShareBoxAlignment};