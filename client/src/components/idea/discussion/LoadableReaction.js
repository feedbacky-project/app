import styled from "@emotion/styled";
import {LIGHT_THEME_COLOR} from "AppAppearance";
import {AppContext} from "context";
import React, {useContext, useState} from "react";
import tinycolor from "tinycolor2";
import {UiLoadingSpinner, UiThemeContext} from "ui";

const Loadable = styled(UiLoadingSpinner)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
`

const DefaultReaction = styled.div`
  position: relative;
  cursor: pointer;
  border: 1px solid transparent;
  background-color: ${props => props.theme.setAlpha(.1).toString()};
  display: inline-block;
  padding: .05rem .3rem;
  margin-right: .25rem;
  border-radius: var(--border-radius);
  color: hsla(0, 0%, 0%, .6);
  transition: var(--hover-transition);

  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }
  
  &:hover {
    background-color: ${props => props.theme.setAlpha(.2).toString()};
  }
`;

const SelectedReaction = styled(DefaultReaction)`
  border: 1px solid ${props => props.theme.setAlpha(.7).toString()};
  background-color: ${props => props.theme.setAlpha(.2).toString()};

  &:hover {
    background-color: ${props => props.theme.setAlpha(.3).toString()};
  }
`;

const LoadableReaction = (props) => {
    const {isSelected, onReact, children} = props;
    const {user} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const [loading, setLoading] = useState(false);
    let Component;
    if (isSelected) {
        Component = SelectedReaction;
    } else {
        Component = DefaultReaction;
    }
    const darkModeColor = tinycolor("#f2f2f2");
    const lightModeColor = tinycolor(LIGHT_THEME_COLOR);

    return <Component onClick={() => {
        setLoading(true);
        onReact().finally(() => setLoading(false));
    }} theme={getTheme()}>
        {loading ? <React.Fragment>
            <Loadable size={"sm"} color={user.darkMode ? darkModeColor : lightModeColor}/>
            <span style={{visibility: "hidden"}}>{children}</span>
        </React.Fragment> : children}
    </Component>
};

export default LoadableReaction;