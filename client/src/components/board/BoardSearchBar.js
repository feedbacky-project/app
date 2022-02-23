import styled from "@emotion/styled";
import {AppContext, BoardContext} from "context";
import React, {useContext} from 'react';
import {TextareaAutosize} from "react-autosize-textarea/lib/TextareaAutosize";
import tinycolor from "tinycolor2";
import {UiBadge, UiThemeContext} from "ui";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";

export const SearchBar = styled(TextareaAutosize)`
  overflow: hidden !important;
  max-height: 33px !important;
  min-height: 33px !important;
  white-space: nowrap;

  @media (max-width: 576px) {
    margin-top: .5rem;
    margin-bottom: .25rem;
  }

  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg fill='${props => props.fill}' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right .75rem center;
  background-size: 16px 12px;
`;

const BoardSearchBar = ({searchQuery, setSearchQuery}) => {
    const {user, onLocalPreferencesUpdate} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const {tags, allIdeas, openedIdeas, closedIdeas} = useContext(BoardContext).data;
    const queryRef = React.useRef();

    if (searchQuery === "" && queryRef.current) {
        queryRef.current.value = "";
    }
    const filters = [
        {opened: {name: "Opened", data: openedIdeas}},
        {closed: {name: "Closed", data: closedIdeas}},
        {all: {name: "All", data: allIdeas}}
    ];
    tags.forEach(tag => filters.push({["tag:" + tag.id]: {name: <UiBadge className={"d-block"} color={tinycolor(tag.color)}>{tag.name}</UiBadge>, data: null}}));
    const sorts = [
        {trending: "Trending"},
        {voters_desc: "Most Voted"},
        {voters_asc: "Least Voted"},
        {newest: "Newest"},
        {oldest: "Oldest"}
    ];
    let searchTimeout;
    const getFilterBadge = (data) => {
        if (data || data === 0) {
            return <UiBadge className={"float-right"}>{data}</UiBadge>
        }
    };
    const filterCurrentValue = Object.values(filters.find(obj => {
        return Object.keys(obj)[0] === (user.localPreferences.ideas.filter || "opened")
    }) || filters[0])[0].name;
    const filterValues = filters.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => onLocalPreferencesUpdate({...user.localPreferences, ideas: {...user.localPreferences.ideas, filter: key}})}>
            <React.Fragment>{value.name} {getFilterBadge(value.data)}</React.Fragment>
        </UiDropdownElement>
    });
    const sortCurrentValue = Object.values(sorts.find(obj => {
        return Object.keys(obj)[0] === (user.localPreferences.ideas.sort || "trending")
    }));
    const sortValues = sorts.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => onLocalPreferencesUpdate({...user.localPreferences, ideas: {...user.localPreferences.ideas, sort: key}})}>{value}</UiDropdownElement>
    });
    const onInput = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => setSearchQuery(queryRef.current.value.substring(0, 40)), 500);
    };
    return <React.Fragment>
        <UiCol sm={8} className={"my-1"}>
            <span className={"align-middle"}>Filtering</span> {" "}
            <UiSelectableDropdown label={"Choose Filter"} id={"filter"} className={"d-inline mr-1"} currentValue={filterCurrentValue} values={filterValues}/>
            <span className={"align-middle"}>and Sorting</span> {" "}
            <UiSelectableDropdown label={"Choose Sort"} id={"sort"} className={"d-inline"} currentValue={sortCurrentValue} values={sortValues}/>
        </UiCol>
        <UiCol sm={4}>
            <UiFormControl label={"Search Ideas"} as={SearchBar} innerRef={queryRef} maxLength={40} rows={1} maxRows={1} defaultValue={searchQuery}
                           placeholder={"Search"} fill={getTheme().setAlpha(.5).toString()} onInput={onInput} aria-label={"Search bar"}/>
        </UiCol>
    </React.Fragment>
};

export default BoardSearchBar;
