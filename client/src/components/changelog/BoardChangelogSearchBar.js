import {AppContext} from "context";
import React, {useContext} from 'react';
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiCol} from "ui/grid";

const BoardChangelogSearchBar = () => {
    const {user, onLocalPreferencesUpdate} = useContext(AppContext);
    const sorts = [
        {newest: "Newest"},
        {oldest: "Oldest"}
    ];
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
            Sorting {" "}
            <UiSelectableDropdown label={"Choose Sort"} id={"sort"} className={"d-inline"} currentValue={sortCurrentValue} values={sortValues}/>
        </UiCol>
    </React.Fragment>
};

export default BoardChangelogSearchBar;
