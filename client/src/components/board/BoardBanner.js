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
  padding: 2rem 1rem;
  @media(min-width: 576px) {
   padding: 4rem 2rem;
  }
  color: white;
  margin-bottom: .5rem;
  text-shadow: 0 0 4px black;
  background-image: url("${props => props.image}");
  
  .dark & {
    box-shadow: var(--dark-box-shadow) !important;
  }
`;

const SocialLinkContainer = styled.div`
  @media(max-width: 576px) {
    position: relative;
    display: inline-block;
    bottom: -26px;
    height: 0;
  }
  @media(min-width: 576px) {
    position: absolute;
    bottom: 6.5%;
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
        return <SocialLinkContainer>
            {socialLinks.map(link => {
                return <SocialLink key={link.id} to={{pathname: link.url}} rel={"noreferrer noopener"} target={"_blank"}>
                    <UiImage src={link.logoUrl} alt={"Social Icon"} width={18} height={18}/>
                </SocialLink>
            })}
            <SocialLink to={{pathname: "/b/" + discriminator + "/roadmap", state: {_boardData: boardData}}}
                        style={{backgroundColor: getTheme().setAlpha(.5)}}>
                <FaMap style={{color: "white"}}/>
            </SocialLink>
        </SocialLinkContainer>
    };
    return <UiCol sm={12} className={"mt-3"}>
        <Banner image={banner}>
            <h3 style={{fontWeight: 500}}>{customName || name}</h3>
            <h5 style={{fontWeight: 300}} dangerouslySetInnerHTML={{__html: shortDescription}}/>
            {renderSocialLinks()}
        </Banner>
    </UiCol>
};

export default BoardBanner;