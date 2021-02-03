import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {FaMap} from "react-icons/all";
import {Link} from "react-router-dom";
import {UiCol} from "ui/grid";
import {UiImage} from "ui/image";

export const Banner = styled.div`
  text-align: center;
  background-position: center;
  box-shadow: var(--box-shadow);
  border-radius: .35rem;
  padding: 4rem 2rem;
  color: white;
  margin-bottom: .5rem;
  text-shadow: 0 0 4px black;
  background-image: url("${props => props.image}");
  
  .dark & {
    box-shadow: var(--dark-box-shadow);
  }
`;

const SocialLink = styled(Link)`
  padding: .5rem 1rem;
  background-color: hsla(0, 0%, 0%, .5);
  transition: .2s ease-in-out;

  &:first-of-type {
    border-top-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
  }

  &:hover {
    background-color: hsla(0, 0%, 0%, .25);
  }
`;

const BoardBanner = ({customName}) => {
    const {getTheme} = useContext(AppContext);
    const {data: boardData} = useContext(BoardContext);
    const {socialLinks, name, shortDescription, banner, discriminator} = boardData;
    const renderSocialLinks = () => {
        let offset = 0;
        return <div className={"d-none d-sm-block"} style={{position: "relative", bottom: "-72px"}}>
            {socialLinks.map(link => {
                offset += 50;
                return <SocialLink key={link.id} to={{pathname: link.url}} rel={"noreferrer noopener"} target={"_blank"}
                                   style={{position: "absolute", bottom: "8px", left: (offset - 50) + "px"}}>
                    <UiImage src={link.logoUrl} alt={"Social Icon"} width={18} height={18}/>
                </SocialLink>
            })}
            <SocialLink to={{pathname: "/b/" + discriminator + "/roadmap", state: {_boardData: boardData}}}
                        style={{position: "absolute", bottom: "8px", left: (offset) + "px", backgroundColor: getTheme().setAlpha(.5)}}>
                <FaMap style={{color: "white"}}/>
            </SocialLink>
        </div>
    };

    const renderSocialLinksMobile = () => {
        return <div className={"d-inline-block d-sm-none"} style={{position: "relative", bottom: "-26px", height: 0}}>
            {socialLinks.map(link => {
                return <SocialLink key={link.id} to={{pathname: link.url}} rel={"noreferrer noopener"} target={"_blank"}>
                    <UiImage src={link.logoUrl} alt={"Social Icon"} width={18} height={18}/>
                </SocialLink>
            })}
            <SocialLink to={{pathname: "/b/" + discriminator + "/roadmap", state: {_boardData: boardData}}}
                        style={{backgroundColor: getTheme().setAlpha(.5)}}>
                <FaMap style={{color: "white"}}/>
            </SocialLink>
        </div>
    };

    return <UiCol sm={12} className={"mt-3"}>
        <Banner image={banner}>
            <h3 style={{fontWeight: 500}}>{customName || name}</h3>
            <h5 style={{fontWeight: 300}} dangerouslySetInnerHTML={{__html: shortDescription}}/>
            {renderSocialLinks()}
            {renderSocialLinksMobile()}
        </Banner>
    </UiCol>
};

export default BoardBanner;