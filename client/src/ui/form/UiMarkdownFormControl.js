import styled from "@emotion/styled";
import TextInputActionModal from "components/commons/TextInputActionModal";
import React, {useRef, useState} from "react";
import {FaBold, FaImage, FaItalic, FaLink} from "react-icons/all";
import {UiFormControl} from "ui/form/UiFormControl";

const MarkdownOptions = styled.div`
  background-color: var(--secondary);
  border-top-right-radius: var(--border-radius);
  border-top-left-radius: var(--border-radius);
  padding: 0.375rem 0.75rem;
`;

const MarkdownIcon = styled.div`
  display: inline-block;
  width: 25px;
  height: 25px;
  text-align: center;
  border-radius: var(--border-radius);
  border: 1px solid var(--disabled);
  background-color: var(--tertiary);
  cursor: pointer;
  
  .dark & {
    background-color: var(--quaternary) !important;
  }
`;

const FormControl = styled(UiFormControl)`
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;

const MarkdownOptionModal = styled.div`
  & .modal-content {
    background-color: var(--tertiary);
  }
`;

const UiMarkdownFormControl = (props) => {
    const ref = useRef(null);
    const {CustomOptions, ...otherProps} = props;
    const [modal, setModal] = useState({open: false, type: ""});
    const [selection, setSelection] = useState(null)
    const markdownInsert = (text, between) => {
        const form = ref.current;
        const scrollPos = form.scrollTop;
        let caretPos = form.selectionStart;

        const front = form.value.substring(0, caretPos);
        const back = form.value.substring(form.selectionEnd, form.value.length);
        if (between) {
            form.value = front + text + selection + text + back;
        } else {
            form.value = front + text + back;
        }
        caretPos = caretPos + text.length;
        form.selectionStart = caretPos;
        form.selectionEnd = caretPos;
        form.focus();
        form.scrollTop = scrollPos;
    };
    return <React.Fragment>
        <MarkdownOptionModal as={TextInputActionModal} size={"sm"} id={"linkInput"} isOpen={modal.open && modal.type === "link"} onHide={() => setModal({...modal, open: false})} actionButtonName={"Insert"}
                              actionDescription={"Insert link, type link URL."} onAction={link => {
            markdownInsert("[" + selection + "](" + link + ")", false);
            return Promise.resolve();
        }}/>
        <MarkdownOptionModal as={TextInputActionModal} className={"test"} size={"sm"} id={"imageInput"} isOpen={modal.open && modal.type === "image"} onHide={() => setModal({...modal, open: false})} actionButtonName={"Insert"}
                              actionDescription={"Insert image, type image URL."} onAction={link => {
            markdownInsert("![" + selection + "](" + link + ")", false);
            return Promise.resolve();
        }}/>
        <MarkdownOptions as={CustomOptions}>
            <MarkdownIcon className={"mr-1"} onClick={() => markdownInsert("**", true)}><FaBold/></MarkdownIcon>
            <MarkdownIcon className={"mr-sm-4 mr-1"} onClick={() => markdownInsert("*", true)}><FaItalic/></MarkdownIcon>
            <MarkdownIcon className={"mr-1"} onClick={() => setModal({open: true, type: "image"})}><FaImage/></MarkdownIcon>
            <MarkdownIcon onClick={() => setModal({open: true, type: "link"})}><FaLink/></MarkdownIcon>
        </MarkdownOptions>
        <FormControl innerRef={ref} onSelect={() => setSelection(window.getSelection().toString())} {...otherProps}/>
    </React.Fragment>
};

export {UiMarkdownFormControl};