import IdeaContext from "context/IdeaContext";
import React, {useContext} from "react";
import tinycolor from "tinycolor2";
import UiBadge from "ui/UiBadge";

const TagsInfo = () => {
    const {tags} = useContext(IdeaContext).ideaData;
    if (tags.length === 0) {
        return <React.Fragment/>;
    }
    return <React.Fragment>
        <div className={"mt-1 text-black-75"}>Tags</div>
        {tags.map((tag, i) => <UiBadge key={i} text={tag.name} color={tinycolor(tag.color)} className={"mr-1"}/>)}
    </React.Fragment>
};

export default TagsInfo;