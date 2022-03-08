import {SearchBar} from "components/board/BoardSearchBar";
import {AppContext} from "context";
import React, {useContext} from 'react';
import {UiThemeContext} from "ui";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiFormControl} from "ui/form";
import {UiCol} from "ui/grid";

const BoardChangelogSearchBar = ({searchQuery, setSearchQuery}) => {
    const {user, onLocalPreferencesUpdate} = useContext(AppContext);
    const {getTheme} = useContext(UiThemeContext);
    const queryRef = React.useRef();

    if (searchQuery === "" && queryRef.current) {
        queryRef.current.value = "";
    }
    const sorts = [
        {newest: "Newest"},
        {oldest: "Oldest"}
    ];
    let searchTimeout;
    const sortCurrentValue = Object.values(sorts.find(obj => {
        return Object.keys(obj)[0] === (user.localPreferences.changelog.sort || "newest")
    }));
    const sortValues = sorts.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => onLocalPreferencesUpdate({...user.localPreferences, changelog: {...user.localPreferences.changelog, sort: key}})}>{value}</UiDropdownElement>
    });
    return <React.Fragment>
        <UiCol sm={8} className={"my-1"}>
            <span className={"align-middle"}>Sorting</span> {" "}
            <UiSelectableDropdown label={"Choose Sort"} id={"sort"} className={"d-inline"} currentValue={sortCurrentValue} values={sortValues}/>
        </UiCol>
        <UiCol sm={4}>
            <UiFormControl label={"Search Ideas"} as={SearchBar} innerRef={queryRef} maxLength={40} rows={1} maxRows={1} defaultValue={searchQuery}
                           placeholder={"Search"} fill={getTheme().setAlpha(.5).toString()} onInput={() => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => setSearchQuery(queryRef.current.value.substring(0, 40)), 500);
            }} aria-label={"Search bar"}/>
        </UiCol>
    </React.Fragment>
};

export default BoardChangelogSearchBar;
