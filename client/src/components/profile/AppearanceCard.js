import styled from "@emotion/styled";
import React, {useContext} from "react";
import {UiCard, UiThemeContext} from "ui";

const OptionCard = styled(UiCard)`
  min-width: 200px;
  width: 200px;
  max-width: 200px;
  cursor: pointer;
  margin: 0.5rem 1rem;
  transition: var(--hover-transition);
  
  .card-img {
    border-radius: .2rem;
  }
`;

const OptionImage = styled.img`
  flex-shrink: 0;
  width: 100%;
  border-radius: .2rem;
`;

const AppearanceCard = ({className, chosen, alt, imgSrc, onClick}) => {
    const {getTheme} = useContext(UiThemeContext);
    let style;
    if (chosen) {
        style = {outline: "1px dashed " + getTheme().toString()};
    }

    return <OptionCard className={className} onClick={onClick} style={style} bodyClassName={"p-0"}>
        <OptionImage alt={alt} src={imgSrc}/>
    </OptionCard>
};

export default AppearanceCard;