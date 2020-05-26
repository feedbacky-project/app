import React, {useContext} from 'react';
import {Col, Dropdown, DropdownItem} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import AppContext from "context/app-context";
import {FaAngleDown} from "react-icons/all";
import BoardContext from "context/board-context";
import {useHistory} from "react-router-dom";

const BoardSearchBar = (props) => {
    const context = useContext(AppContext);
    const boardContext = useContext(BoardContext);
    const history = useHistory();
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
    return <Col sm={12} className="my-1 text-left">
        Filtering {" "}
        <Dropdown className="d-inline mr-1" style={{zIndex: 1}}>
            <DropdownToggle id="filter" variant="" className="btn btn-link m-0 p-0 text-dark font-weight-bold move-top-1px">
                <u>{Object.values(filters.find(obj => {
                    return Object.keys(obj)[0] === (context.user.searchPreferences.filter || "opened")
                }))[0]}</u>
                <FaAngleDown/>
            </DropdownToggle>
            <DropdownMenu alignRight>
                {filters.map(val => {
                    const key = Object.keys(val)[0];
                    const value = Object.values(val)[0];
                    return <DropdownItem key={key} onClick={() => context.onFilteringUpdate(key, boardContext.data, history)}>{value}</DropdownItem>
                })}
            </DropdownMenu>
        </Dropdown>
        and Sorting {" "}
        <Dropdown className="d-inline move-top-1px" style={{zIndex: 1}}>
            <DropdownToggle id="sort" variant="" className="btn btn-link m-0 p-0 text-dark font-weight-bold move-top-1px">
                <u>{Object.values(sorts.find(obj => {
                    return Object.keys(obj)[0] === (context.user.searchPreferences.sort || "trending")
                }))}</u>
                <FaAngleDown/>
            </DropdownToggle>
            <DropdownMenu alignRight>
                {sorts.map(val => {
                    const key = Object.keys(val)[0];
                    const value = Object.values(val)[0];
                    return <DropdownItem key={key} onClick={() => context.onSortingUpdate(key, boardContext.data, history)}>{value}</DropdownItem>
                })}
            </DropdownMenu>
        </Dropdown>
    </Col>
};

export default BoardSearchBar;
