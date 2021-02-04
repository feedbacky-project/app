import axios from "axios";
import {renderModal} from "components/commons/tag-modal-commons";
import BoardContext from "context/BoardContext";
import {useContext, useEffect, useState} from "react";
import {toastError, toastSuccess, toastWarning} from "utils/basic-utils";

const TagEditModal = ({tag, isOpen, onHide, onEdit}) => {
    const {data} = useContext(BoardContext);
    const [color, setColor] = useState(tag.color);
    useEffect(() => {
        setColor(tag.color);
    }, [tag]);

    const handleSubmit = () => {
        const name = document.getElementById("tagNameTextarea").value;
        if (name.length < 3 || name.length > 20) {
            toastWarning("Tag name must be between 3 and 20 characters.");
            return Promise.resolve();
        }
        const roadmapIgnored = document.getElementById("roadmapIgnored").checked;
        const publicUse = document.getElementById("publicUse").checked;
        return axios.patch("/boards/" + data.discriminator + "/tags/" + tag.name, {
            name, color, roadmapIgnored, publicUse,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                toastError();
                return;
            }
            onHide();
            onEdit(tag, res.data);
            toastSuccess("Tag edited.");
        }).catch(err => toastError(err.response.data.errors[0]));
    };
    return renderModal(isOpen, onHide, "Edit Tag", handleSubmit, color, setColor, {name: tag.name, roadmapIgnored: tag.roadmapIgnored, publicUse: tag.publicUse});
};

export default TagEditModal;