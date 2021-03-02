import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import React, {useContext} from 'react';
import {TextareaAutosize} from "react-autosize-textarea/lib/TextareaAutosize";
import tinycolor from "tinycolor2";
import {UiBadge} from "ui";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";

const SearchBar = styled(TextareaAutosize)`
  overflow: hidden !important;
  max-height: 33px !important;
  min-height: 33px !important;
  white-space: nowrap;
  
  @media(max-width: 576px) {
    margin-top: .5rem;
    margin-bottom: .25rem;
  }
`;

const BoardSearchBar = ({searchQuery, setSearchQuery}) => {
    const {user, onLocalPreferencesUpdate} = useContext(AppContext);
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
    tags.forEach(tag => filters.push({["tag:" + tag.id]: {name: <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>, data: null}}));
    const sorts = [
        {trending: "Trending"},
        {voters_desc: "Most Voted"},
        {voters_asc: "Least Voted"},
        {newest: "Newest"},
        {oldest: "Oldest"}
    ];
    let searchTimeout;
    const filterCurrentValue = Object.values(filters.find(obj => {
        return Object.keys(obj)[0] === (user.localPreferences.ideas.filter || "opened")
    }) || filters[0])[0].name;
    const filterValues = filters.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => onLocalPreferencesUpdate({...user.localPreferences, ideas: {...user.localPreferences.ideas, filter: key}})}>
            <React.Fragment>{value.name} {value.data && <UiBadge className={"float-right"}>{value.data}</UiBadge>}</React.Fragment>
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
    return <React.Fragment>
        <UiCol sm={8} className={"my-1"}>
            Filtering {" "}
            <UiSelectableDropdown label={"Choose Filter"} id={"filter"} className={"d-inline mr-1"} currentValue={filterCurrentValue} values={filterValues}/>
            and Sorting {" "}
            <UiSelectableDropdown label={"Choose Sort"} id={"sort"} className={"d-inline"} currentValue={sortCurrentValue} values={sortValues}/>
        </UiCol>
        <UiCol sm={4}>
            <UiFormControl label={"Search Ideas"} as={SearchBar} innerRef={queryRef} maxLength={40} rows={1} maxRows={1} defaultValue={searchQuery} placeholder={"Search"} onInput={() => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => setSearchQuery(queryRef.current.value.substring(0, 40)), 500);
            }} aria-label={"Search bar"}/>
        </UiCol>
    </React.Fragment>
};

export default BoardSearchBar;
