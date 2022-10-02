import {AppContext, BoardContext} from "context";
import React, {useContext, useEffect, useRef, useState} from "react";
import tinycolor from "tinycolor2";
import {UiBadge} from "ui";
import {UiButton} from "ui/button";
import {UiDropdownElement, UiSelectableDropdown} from "ui/dropdown";
import {UiFormControl, UiFormLabel, UiFormSelect} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const AdvancedFiltersModal = ({isOpen, onHide, onSelect}) => {
    const ref = useRef();
    const {localPreferences} = useContext(AppContext).user;
    const {tags, allIdeas, openedIdeas, closedIdeas} = useContext(BoardContext).data;
    const [text, setText] = useState();
    const [votersAmount, setVotersAmount] = useState({selector: "above", amount: -1});
    const [status, setStatus] = useState("all");
    const [chosenTags, setChosenTags] = useState([]);
    useEffect(() => {
        const advanced = localPreferences.ideas.advanced;
        if(advanced) {
            advanced.text && setText(advanced.text);
            advanced.status && setStatus(advanced.status);
            advanced.tags && setChosenTags(advanced.tags.map(id => tags.find(t => t.id === id)));
            advanced.voters && setVotersAmount({selector: Object.keys(advanced.voters)[0], amount: Object.values(advanced.voters)[0]});
        }
    }, [localPreferences]);


    const onFiltersSelect = () => {
        const data = {
            text: text,
            status: status,
            tags: chosenTags.map(t => t.id),
            voters: {[votersAmount.selector]: votersAmount.amount}
        };
        onSelect(data);
        onHide();
    };
    const getFilterBadge = (data) => {
        if (data || data === 0) {
            return <UiBadge className={"float-right"}>{data}</UiBadge>
        }
    };
    const selectors = [
        {above: {name: "Above"}},
        {below: {name: "Below"}}
    ];
    const statuses = [
        {opened: {name: "Opened", data: openedIdeas}},
        {closed: {name: "Closed", data: closedIdeas}},
        {all: {name: "All", data: allIdeas}}
    ];
    const statusValues = statuses.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => setStatus(key)}>
            <React.Fragment>{value.name} {getFilterBadge(value.data)}</React.Fragment>
        </UiDropdownElement>
    });
    const statusCurrentValue = Object.values(statuses.find(obj => {
        return Object.keys(obj)[0] === (status || "all")
    }) || statuses[0])[0].name;
    const tagsData = [];
    tags.forEach(tag => tagsData.push({["tag:" + tag.id]: {name: <UiBadge className={"d-block"} color={tinycolor(tag.color)}>{tag.name}</UiBadge>, data: null}}));
    const selectorCurrentValue = Object.values(selectors.find(obj => {
        return Object.keys(obj)[0] === (votersAmount.selector || "above")
    }) || selectors[0])[0].name;
    const selectorValues = selectors.map(val => {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        return <UiDropdownElement key={key} onClick={() => setVotersAmount({...votersAmount, selector: key})}>{value.name}</UiDropdownElement>
    });

    const onTagChange = changed => {
        setChosenTags(changed.map(option => tags.find(t => t.id === option.value)));
    }
    return <UiDismissibleModal id={"advancedFilter"} isOpen={isOpen} onHide={onHide} title={"Advanced Filters"} applyButton={<UiButton label={"Apply"} onClick={onFiltersSelect}>Apply</UiButton>} onEntered={() => ref.current && ref.current.focus()} size={"md"}>
        <UiRow className={"mb-3"}>
            <UiCol xs={12} className={"text-black-75 text-center my-2"}>
                Search ideas by selected filter options.
                <br/>
                Leave options blank to exclude them from the search.
            </UiCol>
            <UiCol xs={12} sm={6} className={"mt-2"}>
                <UiFormLabel>By Contained Text</UiFormLabel>
                <UiCol xs={12} className={"d-inline-block px-0"}>
                    <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                        <UiFormControl minLength={0} maxLength={40} rows={1} type={"text"} placeholder={"Keywords you look for."} defaultValue={text}
                                       id={"keywords"} label={"Keywords to search"} onChange={e => setText(e.target.value)} innerRef={ref}/>
                    </UiCol>
                </UiCol>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mt-2"}>
                <UiFormLabel>By Status</UiFormLabel>
                <UiCol xs={12} className={"d-inline-block px-0"}>
                    <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"} style={{zIndex: 20}}>
                        <UiSelectableDropdown label={"Choose Status"} id={"status"} toggleClassName={"w-100"} className={"d-inline"} currentValue={statusCurrentValue} values={statusValues}
                                              toggleStyle={{minHeight: "36px"}}/>
                    </UiCol>
                </UiCol>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mt-2"}>
                <UiFormLabel>By Tags</UiFormLabel>
                <UiCol xs={12} className={"d-inline-block px-0"}>
                    <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"} style={{zIndex: 15}}>
                        <UiFormSelect name={"tagSelector"} value={chosenTags.map(tag => ({value: tag.id, label: <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}))} isMulti options={tags.map(tag => ({value: tag.id, label: <UiBadge color={tinycolor(tag.color)}>{tag.name}</UiBadge>}))}
                                      onChange={onTagChange} placeholder={"Choose Tags"}
                                      filterOption={(candidate, input) => {
                                          return candidate.data.__isNew__ || tags.find(t => t.id === candidate.value).name.toLowerCase().includes(input.toLowerCase());
                                      }}/>
                    </UiCol>
                </UiCol>
            </UiCol>
            <UiCol xs={12} sm={6} className={"mt-2"}>
                <UiFormLabel>By Voters Amount</UiFormLabel>
                <UiCol xs={12} className={"d-inline-block px-0"}>
                    <UiCol xs={12} className={"pr-sm-0 pr-2 px-0 d-inline-block"}>
                        <UiRow noGutters>
                            <UiCol xs={5}>
                                <UiSelectableDropdown label={"Selector"} id={"selector"} toggleClassName={"w-100"} className={"d-inline"} currentValue={selectorCurrentValue} values={selectorValues}
                                                      toggleStyle={{borderTopRightRadius: 0, borderBottomRightRadius: 0, height: "100%"}}/>
                            </UiCol>
                            <UiCol xs={7}>
                                <UiFormControl minLength={0} maxLength={6} rows={1} type={"number"} step={1} placeholder={"A number."} onChange={e => setVotersAmount({...votersAmount, amount: e.target.value})}
                                               defaultValue={votersAmount.amount === -1 ? null : votersAmount.amount} className={"d-inline-block"} id={"votersAmount"} label={"A number"} style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}/>
                            </UiCol>
                        </UiRow>
                    </UiCol>
                </UiCol>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};

export default AdvancedFiltersModal;