import axios from "axios";
import {renderModal} from "components/commons/tag-modal-commons";
import AppContext from "context/AppContext";
import BoardContext from "context/BoardContext";
import {useContext, useState} from 'react';
import {popupError, popupNotification, popupWarning} from "utils/basic-utils";

const TagCreateModal = ({isOpen, onHide, onTagCreate}) => {
    const {getTheme} = useContext(AppContext);
    const {data} = useContext(BoardContext);
    const [color, setColor] = useState("#0994f6");
    const [tagData, setTagData] = useState({name: "", roadmapIgnored: false, publicUse: false});

    const handleSubmit = () => {
        const name = tagData.name;
        if (name.length < 3 || name.length > 20) {
            popupWarning("Tag name must be between 3 and 20 characters");
            return Promise.resolve();
        }
        const roadmapIgnored = tagData.roadmapIgnored;
        const publicUse = tagData.publicUse;
        return axios.post("/boards/" + data.discriminator + "/tags", {
            name, color, roadmapIgnored, publicUse,
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                popupError();
                return;
            }
            onHide();
            onTagCreate(res.data);
            popupNotification("Tag created", getTheme());
        });
    };
    return renderModal(isOpen, onHide, "Add new Tag", handleSubmit, color, setColor, tagData, setTagData);
};

export default TagCreateModal;