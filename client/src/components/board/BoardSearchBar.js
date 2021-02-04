import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {TextareaAutosize} from "react-autosize-textarea/lib/TextareaAutosize";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiCol} from "ui/grid";

const SearchBar = styled(TextareaAutosize)`
  overflow: hidden !important;
  max-height: 33px;
  min-height: 33px;
  white-space: nowrap;
  
  @media(max-width: 576px) {
    margin-top: .5rem;
    margin-bottom: .25rem;
  }
`;

const BoardSearchBar = ({searchQuery, setSearchQuery}) => {
    const {user, onLocalPreferencesUpdate} = useContext(AppContext);
    const queryRef = React.useRef();
    if (searchQuery === "" && queryRef.current) {
        queryRef.current.value = "";
    }
    const filters = [
        {opened: "Opened"},
        {closed: "Closed"},
        {all: "All"}
    ];
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
    }));
    const filterValues = filters.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => onLocalPreferencesUpdate({...user.localPreferences, ideas: {...user.localPreferences.ideas, filter: key}})}>{value}</UiDropdownElement>
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
            <SearchBar ref={queryRef} className={"form-control"} maxLength={40} rows={1} maxRows={1} defaultValue={searchQuery} placeholder={"Search"} onInput={() => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => setSearchQuery(queryRef.current.value.substring(0, 40)), 500);
            }}  aria-label={"Search bar"}/>
        </UiCol>
    </React.Fragment>
};

export default BoardSearchBar;
