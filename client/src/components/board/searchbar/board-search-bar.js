import React, {useContext} from 'react';
import {Col, Dropdown} from "react-bootstrap";
import AppContext from "context/app-context";
import {TextareaAutosize} from "react-autosize-textarea/lib/TextareaAutosize";
import PageSelectableDropdown from "../../app/page-selectable-dropdown";

const BoardSearchBar = ({searchQuery, setSearchQuery}) => {
    const context = useContext(AppContext);
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
    const filterCurrentValue =  Object.values(filters.find(obj => {
        return Object.keys(obj)[0] === (context.user.localPreferences.ideas.filter || "opened")
    }));
    const filterValues = filters.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <Dropdown.Item key={key} onClick={() => context.onLocalPreferencesUpdate({...context.user.localPreferences, ideas: {...context.user.localPreferences.ideas, filter: key}})}>{value}</Dropdown.Item>
    });
    const sortCurrentValue = Object.values(sorts.find(obj => {
        return Object.keys(obj)[0] === (context.user.localPreferences.ideas.sort || "trending")
    }));
    const sortValues = sorts.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <Dropdown.Item key={key} onClick={() => context.onLocalPreferencesUpdate({...context.user.localPreferences, ideas: {...context.user.localPreferences.ideas, sort: key}})}>{value}</Dropdown.Item>
    });
    return <React.Fragment>
        <Col sm={8} className="my-1 text-left">
            Filtering {" "}
            <PageSelectableDropdown id={"filter"} className={"d-inline mr-1"} currentValue={filterCurrentValue} values={filterValues}/>
            and Sorting {" "}
            <PageSelectableDropdown id={"sort"} className={"d-inline"} currentValue={sortCurrentValue} values={sortValues}/>
        </Col>
        <Col sm={4}>
            <TextareaAutosize ref={queryRef} className="form-control search-bar bg-lighter mt-sm-0 mt-1 mb-sm-0 mb-1" maxLength={40} rows={1} maxRows={1} as="textarea" defaultValue={searchQuery}
                              placeholder="Search" onInput={e => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => setSearchQuery(queryRef.current.value.substring(0, 40)), 500);
            }}/>
        </Col>
    </React.Fragment>
};

export default BoardSearchBar;
