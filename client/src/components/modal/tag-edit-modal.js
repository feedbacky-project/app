import React, {Suspense, useContext, useEffect, useState} from "react";
import AppContext from "context/app-context";
import {formatRemainingCharacters, toastError, toastSuccess, toastWarning} from "components/util/utils";
import axios from "axios";
import PageModal from "components/modal/page-modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ClickableTip from "components/util/clickable-tip";
import LoadingSpinner from "components/util/loading-spinner";
import {ChromePicker} from "react-color";
import {Col, Row} from "react-bootstrap";
import tinycolor from "tinycolor2";
import {FaExclamationCircle} from "react-icons/all";

const TagEditModal = ({tag, boardData, open, onClose, onEdit}) => {
    const context = useContext(AppContext);
    const [color, setColor] = useState(tag.color);
    const colorWarning = tinycolor.readability(color, "#fff") < 2.0 || tinycolor.readability(tinycolor(color).lighten(10), "#292c30") < 2.0;
    useEffect(() => {
        setColor(tag.color);
    }, [tag]);

    const handleSubmit = () => {
        const name = document.getElementById("tagNameTextarea").value;
        if (name.length < 3 || name.length > 20) {
            toastWarning("Tag name must be between 3 and 20 characters.");
            return;
        }
        const roadmapIgnored = document.getElementById("roadmapIgnored").checked;
        axios.patch("/boards/" + boardData.discriminator + "/tags/" + tag.name, {
            name, color, roadmapIgnored,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            onClose();
            onEdit(tag, {name, color, roadmapIgnored});
            toastSuccess("Tag edited.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };

    const textClass = colorWarning ? "text-danger" : "text-black-60";
    return <PageModal id="tagCreate" isOpen={open} onHide={onClose} title="Edit Tag"
                      applyButton={<Button variant="" type="submit" style={{backgroundColor: context.getTheme()}} onClick={handleSubmit} className="mx-0">Save</Button>}>
        <Row>
            <Col xs={12} className="mt-2 mb-1">
                <Form.Label className="mr-1 text-black-60">Tag Name</Form.Label>
                <ClickableTip id="tagName" title="Tag Name" description="Descriptive and under 20 characters name of tag."/>
                <Form.Control style={{minHeight: 38, resize: "none"}} minLength="2" maxLength="15" rows="1" required type="text" defaultValue={tag.name}
                              placeholder="Short and descriptive." id="tagNameTextarea" onKeyUp={() => formatRemainingCharacters("remainingTag", "tagNameTextarea", 15)}/>
                <Form.Text className="text-right text-black-60" id="remainingTag">
                    15 Remaining
                </Form.Text>
            </Col>
            <Col xs={12} sm={6} className="mb-2">
                <Form.Label className={"mr-1 " + textClass}>Tag Color</Form.Label>
                <ClickableTip id="tagColor" title="Tag Color" description="Choose color of the tag. Avoid too bright and too dark colors, poorly visible in Light and Dark Themes."/>
                {!colorWarning || <ClickableTip id="colorWarn" title="Color Warning" description="This color is considered either too dark or too bright and might look bad on Light or Dark Mode."
                                                icon={<FaExclamationCircle className="fa-xs text-danger move-top-1px ml-1"/>}/>}
                <br/>
                <Suspense fallback={<LoadingSpinner/>}>
                    <ChromePicker className="text-center" disableAlpha color={color} onChangeComplete={changedColor => setColor(changedColor.hex)}/>
                </Suspense>
            </Col>
            <Col xs={12} sm={6} className="mb-2">
                <Form.Label className="mr-1 text-black-60">Ignore Roadmap</Form.Label>
                <ClickableTip id="tagColor" title="Ignore Roadmap" description="Select if you don't want to include show tag and ideas with this tag in roadmap view."/>
                <br/>
                <Form.Check id="roadmapIgnored" custom inline label="Roadmap Ignored" type="checkbox" defaultChecked={tag.roadmapIgnored}/>
            </Col>
        </Row>
    </PageModal>
};

export default TagEditModal;