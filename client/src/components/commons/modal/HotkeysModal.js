import styled from "@emotion/styled";
import React, {useState} from "react";
import {useHotkeys} from "react-hotkeys-hook";
import {UiKeyboardInput} from "ui";
import {UiFormLabel} from "ui/form";
import {UiCol, UiRow} from "ui/grid";
import {UiDismissibleModal} from "ui/modal";

const Hotkey = styled(UiKeyboardInput)`
    font-weight: bold;
`;

const HotkeysModal = () => {
    const [open, setOpen] = useState(false);
    useHotkeys("ctrl+k", e => {
        e.preventDefault();
        setOpen(true);
    });

    const title = <React.Fragment>Hotkeys Menu <UiKeyboardInput>CTRL</UiKeyboardInput> <UiKeyboardInput>K</UiKeyboardInput></React.Fragment>
    return <UiDismissibleModal id={"hotkeys"} isOpen={open} onHide={() => setOpen(false)} title={title} size={"lg"} className={"mx-0"} applyButton={<React.Fragment/>}>
        <UiRow centered className={"mt-3"}>
            <UiCol xs={12} className={"mb-2 px-4 text-center"}>
                Use hotkeys below to navigate around the page more easily.
            </UiCol>
            <UiCol xs={12} md={6}>
                <UiFormLabel>Board Page</UiFormLabel>
                <div><Hotkey>/</Hotkey> - Focus the Search Bar</div>
                <div><Hotkey>C</Hotkey> - Open New Idea Modal</div>
                <div><Hotkey>,</Hotkey> or <Hotkey>.</Hotkey> - Focus Previous/Next Idea</div>
                <div><Hotkey>V</Hotkey> - Toggle Vote of Focused Idea</div>
                <div><Hotkey>M</Hotkey> - Open Mod Actions on Focused Idea</div>
                <div><Hotkey>SHIFT</Hotkey> + <Hotkey>F</Hotkey> - Navigate to Feedback Page</div>
                <div><Hotkey>SHIFT</Hotkey> + <Hotkey>R</Hotkey> - Navigate to Roadmap Page</div>
                <div><Hotkey>SHIFT</Hotkey> + <Hotkey>C</Hotkey> - Navigate to Changelogs Page</div>
            </UiCol>
            <UiCol xs={12} md={6}>
                <UiFormLabel>Idea Page</UiFormLabel>
                <div><Hotkey>C</Hotkey> - Focus Comment Write Box</div>
                <div><Hotkey>,</Hotkey> or <Hotkey>.</Hotkey> - Focus Previous/Next Comment</div>
                <div><Hotkey>R</Hotkey> - Reply to Focused Comment</div>
                <div><Hotkey>V</Hotkey> - Toggle Vote of Idea</div>
                <div><Hotkey>M</Hotkey> - Open Mod Actions of Idea</div>
                <div><Hotkey>←</Hotkey> - Go Back to Board Page</div>
            </UiCol>
        </UiRow>
    </UiDismissibleModal>
};

export default HotkeysModal;