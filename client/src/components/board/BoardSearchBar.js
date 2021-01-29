import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {TextareaAutosize} from "react-autosize-textarea/lib/TextareaAutosize";
import UiDropdownElement from "ui/dropdown/UiDropdownElement";
import UiSelectableDropdown from "ui/dropdown/UiSelectableDropdown";
import UiCol from "ui/grid/UiCol";

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
        <UiCol sm={8} className={"my-1 text-left"}>
            Filtering {" "}
            <UiSelectableDropdown id={"filter"} className={"d-inline mr-1"} currentValue={filterCurrentValue} values={filterValues}/>
            and Sorting {" "}
            <UiSelectableDropdown id={"sort"} className={"d-inline"} currentValue={sortCurrentValue} values={sortValues}/>
        </UiCol>
        <UiCol sm={4}>
            <TextareaAutosize ref={queryRef} className={"form-control search-bar bg-lighter mt-sm-0 mt-2 mb-sm-0 mb-1"} maxLength={40} rows={1} maxRows={1} defaultValue={searchQuery}
                              placeholder={"Search"} onInput={() => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => setSearchQuery(queryRef.current.value.substring(0, 40)), 500);
            }}/>
        </UiCol>
    </React.Fragment>
};

export default BoardSearchBar;
