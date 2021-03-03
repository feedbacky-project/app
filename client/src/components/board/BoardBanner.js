import styled from "@emotion/styled";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {UiCol} from "ui/grid";
import {UiImage} from "ui/image";

export const Banner = styled.div`
  text-align: center;
  background-position: center;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
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
    bottom: -23px;
    height: 0;
  }
  @media(min-width: 576px) {
    position: absolute;
    bottom: 8.2%;
  }
`;

const SocialLink = styled(Link)`
  padding: .7rem 1rem;
  background-color: hsla(0, 0%, 0%, .5);
  transition: var(--hover-transition);

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
    const {data: boardData} = useContext(BoardContext);
    const {socialLinks, name, shortDescription, banner} = boardData;
    const renderSocialLinks = () => {
        return <SocialLinkContainer>
            {socialLinks.map(link => {
                return <SocialLink key={link.id} to={{pathname: link.url}} rel={"noreferrer noopener"} target={"_blank"}>
                    <UiImage src={link.logoUrl} alt={"Social Icon"} width={18} height={18}/>
                </SocialLink>
            })}
        </SocialLinkContainer>
    };
    return <UiCol sm={12} className={"mt-2"}>
        <Banner image={banner}>
            <h3 style={{fontWeight: 500}}>{customName || name}</h3>
            <h5 style={{fontWeight: 300}} dangerouslySetInnerHTML={{__html: shortDescription}}/>
            {renderSocialLinks()}
        </Banner>
    </UiCol>
};

export default BoardBanner;