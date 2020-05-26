import React from "react";
import PageBadge from "components/app/page-badge";
import tinycolor from "tinycolor2";

const TagsComponent = ({data}) => {
    if (data.length === 0) {
        return <React.Fragment/>;
    }
    return <React.Fragment>
        <div className="mt-1 text-black-75">Tags</div>
        {data.map((tag, i) => <PageBadge key={i} text={tag.name} color={tinycolor(tag.color)} className="mr-1"/>)}
    </React.Fragment>
};

export default TagsComponent;