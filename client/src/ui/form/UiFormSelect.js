import React from "react";
import Select from "react-select";

const UiFormSelect = (props) => {
    const {name, ...otherProps} = props;

    return <Select name={name} {...otherProps}
                   styles={{
                       menu: (base) => ({
                           ...base,
                           color: "var(--font-color)",
                           borderRadius: "var(--border-radius)",
                           backgroundColor: "var(--secondary)",
                           border: "none",
                           outline: "none",
                           boxShadow: "var(--box-shadow)"
                       }),
                       valueContainer: (base) => ({
                           ...base,
                           color: "var(--font-color)",
                           borderRadius: "var(--border-radius)",
                           backgroundColor: "var(--secondary)",
                           border: "none",
                           outline: "none",
                           boxShadow: "var(--box-shadow)"
                       }),
                       container: (base) => ({
                           ...base,
                           cursor: "pointer",
                           color: "var(--font-color)",
                           borderRadius: "var(--border-radius)",
                           backgroundColor: "var(--secondary)",
                           border: "none",
                           outline: "none",
                           boxShadow: "var(--box-shadow)"
                       }),
                       control: (base) => ({
                           ...base,
                           cursor: "pointer",
                           color: "var(--font-color)",
                           borderRadius: "var(--border-radius)",
                           backgroundColor: "var(--secondary)",
                           border: "none",
                           outline: "none",
                           boxShadow: "var(--box-shadow)"
                       }),
                       multiValue: (base) => ({
                           ...base,
                           color: "var(--font-color)",
                           borderRadius: "var(--border-radius)",
                           backgroundColor: "var(--quaternary)",
                           border: "none",
                           outline: "none",
                           boxShadow: "var(--box-shadow)",
                           marginLeft: 0,
                           paddingLeft: 0
                       }),
                       input: (base) => ({...base, color: "var(--font-color)"}),
                       multiValueLabel: (base) => ({
                           ...base,
                           padding: 0,
                           paddingLeft: 0,
                           lineHeight: 1.2,
                           borderRadius: "var(--border-radius)",
                           borderBottomRightRadius: 0,
                           borderTopRightRadius: 0,
                           "& > div": {
                               borderBottomRightRadius: 0,
                               borderTopRightRadius: 0
                           }
                       }),
                       multiValueRemove: (base) => ({
                           ...base,
                           color: "var(--text-red)",
                           borderRadius: "var(--border-radius)",
                           borderBottomLeftRadius: 0,
                           borderTopLeftRadius: 0,
                           "&:hover": {
                               backgroundColor: "var(--hover)"
                           }
                       }),
                       clearIndicator: (base) => ({...base, color: "var(--font-color-60)", "&:hover": {color: "var(--font-color)"}}),
                       dropdownIndicator: (base) => ({...base, color: "var(--font-color-60)", "&:hover": {color: "var(--font-color)"}}),
                       indicatorSeparator: (base) => ({...base, backgroundColor: "var(--quaternary)"}),
                       option: (base, state) => ({...base, cursor: "pointer", backgroundColor: state.isFocused ? 'var(--hover)' : 'var(--secondary)',}),
                       placeholder: (base) => ({...base, color: "var(--font-color-50)"})
                   }}
    />
};

export {UiFormSelect};