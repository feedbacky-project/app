import React, {useContext} from 'react';
import {Col, Dropdown, DropdownItem} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import AppContext from "../../../context/app-context";

const BoardSearchBar = (props) => {
    const context = useContext(AppContext);
    const resolveFiltering = () => {
        switch (context.user.searchPreferences.filter) {
            case "all":
                return "All";
            case "closed":
                return "Closed";
            case "opened":
            default:
                return "Opened";
        }
    };
    const resolveSorting = () => {
        switch (context.user.searchPreferences.sort) {
            case "voters_asc":
                return "Least Voted";
            case "newest":
                return "Newest";
            case "oldest":
                return "Oldest";
            case "voters_desc":
                return "Most Voted";
            case "trending":
            default:
                return "Trending";
        }
    };

    return <Col sm={12} className="my-1 text-left">
        Filtering {" "}
        <Dropdown className="d-inline mr-1" style={{zIndex: 1}}>
            <DropdownToggle id="filter" variant="" className="btn btn-link m-0 p-0 text-dark font-weight-bold move-top-1px">
                <u>{resolveFiltering()}</u>
            </DropdownToggle>
            <DropdownMenu alignRight>
                <DropdownItem onClick={() => context.onFilteringUpdate("opened", props.boardData, props.moderators, props.history, props.discriminator)}>
                    Opened
                </DropdownItem>
                <DropdownItem onClick={() => context.onFilteringUpdate("closed", props.boardData, props.moderators, props.history, props.discriminator)}>
                    Closed
                </DropdownItem>
                <DropdownItem onClick={() => context.onFilteringUpdate("all", props.boardData, props.moderators, props.history, props.discriminator)}>
                    All
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
        and Sorting {" "}
        <Dropdown className="d-inline move-top-1px" style={{zIndex: 1}}>
            <DropdownToggle id="sort" variant="" className="btn btn-link m-0 p-0 text-dark font-weight-bold move-top-1px">
                <u>{resolveSorting()}</u>
            </DropdownToggle>
            <DropdownMenu alignRight>
                <DropdownItem onClick={() => context.onSortingUpdate("trending", props.boardData, props.moderators, props.history, props.discriminator)}>
                    Trending
                </DropdownItem>
                <DropdownItem onClick={() => context.onSortingUpdate("voters_desc", props.boardData, props.moderators, props.history, props.discriminator)}>
                    Most Voted
                </DropdownItem>
                <DropdownItem onClick={() => context.onSortingUpdate("voters_asc", props.boardData, props.moderators, props.history, props.discriminator)}>
                    Least Voted
                </DropdownItem>
                <DropdownItem onClick={() => context.onSortingUpdate("newest", props.boardData, props.moderators, props.history, props.discriminator)}>
                    Newest
                </DropdownItem>
                <DropdownItem onClick={() => context.onSortingUpdate("oldest", props.boardData, props.moderators, props.history, props.discriminator)}>
                    Oldest
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </Col>
};

export default BoardSearchBar;
