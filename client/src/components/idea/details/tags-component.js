import React, {useContext} from "react";
import PageBadge from "components/app/page-badge";
import tinycolor from "tinycolor2";
import IdeaContext from "../../../context/idea-context";

const TagsComponent = () => {
    const {tags} = useContext(IdeaContext).ideaData;
    if (tags.length === 0) {
        return <React.Fragment/>;
    }
    return <React.Fragment>
        <div className="mt-1 text-black-75">Tags</div>
        {tags.map((tag, i) => <PageBadge key={i} text={tag.name} color={tinycolor(tag.color)} className="mr-1"/>)}
    </React.Fragment>
};

export default TagsComponent;