import React, {useContext} from 'react';
import {Col, Dropdown} from "react-bootstrap";
import AppContext from "context/app-context";
import {FaAngleDown} from "react-icons/all";
import {TextareaAutosize} from "react-autosize-textarea/lib/TextareaAutosize";

const BoardSearchBar = ({searchQuery, setSearchQuery}) => {
    const context = useContext(AppContext);
    const queryRef = React.useRef();
    if(searchQuery === "" && queryRef.current) {
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
    return <React.Fragment>
        <Col sm={8} className="my-1 text-left">
            Filtering {" "}
            <Dropdown className="d-inline mr-1" style={{zIndex: 1}}>
                <Dropdown.Toggle id="filter" variant="" className="search-dropdown-bar btn btn-link text-dark move-top-1px">
                <span>{Object.values(filters.find(obj => {
                    return Object.keys(obj)[0] === (context.user.localPreferences.ideas.filter || "opened")
                }))}</span>
                    <FaAngleDown/>
                </Dropdown.Toggle>
                <Dropdown.Menu alignRight>
                    {filters.map(val => {
                        const key = Object.keys(val)[0];
                        const value = Object.values(val)[0];
                        return <Dropdown.Item key={key} onClick={() => context.onLocalPreferencesUpdate({...context.user.localPreferences, ideas: {...context.user.localPreferences.ideas, filter: key}})}>{value}</Dropdown.Item>
                    })}
                </Dropdown.Menu>
            </Dropdown>
            and Sorting {" "}
            <Dropdown className="d-inline" style={{zIndex: 1}}>
                <Dropdown.Toggle id="sort" variant="" className="search-dropdown-bar btn btn-link text-dark move-top-1px">
                <span>{Object.values(sorts.find(obj => {
                    return Object.keys(obj)[0] === (context.user.localPreferences.ideas.sort || "trending")
                }))}</span>
                    <FaAngleDown/>
                </Dropdown.Toggle>
                <Dropdown.Menu alignRight>
                    {sorts.map(val => {
                        const key = Object.keys(val)[0];
                        const value = Object.values(val)[0];
                        return <Dropdown.Item key={key} onClick={() => context.onLocalPreferencesUpdate({...context.user.localPreferences, ideas: {...context.user.localPreferences.ideas, sort: key}})}>{value}</Dropdown.Item>
                    })}
                </Dropdown.Menu>
            </Dropdown>
        </Col>
        <Col sm={4}>
            <TextareaAutosize ref={queryRef} className="form-control search-bar bg-lighter mt-sm-0 mt-1" maxLength={40} rows={1} maxRows={1} as="textarea" defaultValue={searchQuery}
                              placeholder="Search" onInput={() => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => setSearchQuery(queryRef.current.value), 500);
            }}/>
        </Col>
    </React.Fragment>
};

export default BoardSearchBar;
