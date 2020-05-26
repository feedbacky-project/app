import React from 'react';
import {Col, Jumbotron} from "react-bootstrap";
import SafeAnchor from "components/app/safe-anchor";

const BoardBanner = ({socialLinks, bannerUrl, name, description}) => {
    const renderSocialLinks = () => {
        if (socialLinks.length === 0) {
            return <React.Fragment/>
        }
        let offset = 0;
        return <div className="d-none d-sm-block" style={{position: "relative", bottom: "-72px"}}>
            {socialLinks.map(link => {
                offset += 50;
                return <div key={link.id} className="social-link" style={{position: "absolute", bottom: "8px", left: (offset - 50) + "px"}}>
                    <SafeAnchor url={link.url}><img src={link.logoUrl} alt="Social Icon" width={18} height={18}/></SafeAnchor>
                </div>
            })}
        </div>
    };

    const renderSocialLinksMobile = () => {
        if (socialLinks.length === 0) {
            return <React.Fragment/>
        }
        return <div className="d-inline-block d-sm-none" style={{position: "relative", bottom: "-26px", height: 0}}>
            {socialLinks.map(link => {
                return <div key={link.id} className="d-inline social-link">
                    <SafeAnchor url={link.url}><img src={link.logoUrl} alt="Social Icon" width={18} height={18} className="img-fluid"/></SafeAnchor>
                </div>
            })}
        </div>
    };

    return <Col sm={12} className="mt-3">
        <Jumbotron className="mb-2 small-text-shadow dark-mask"
                   style={{backgroundImage: `url("` + bannerUrl + `")`}}>
            <h3 style={{fontWeight: 500}}>{name}</h3>
            <h5 style={{fontWeight: 300}} dangerouslySetInnerHTML={{__html: description}}/>
            {renderSocialLinks()}
            {renderSocialLinksMobile()}
        </Jumbotron>
    </Col>
};

export default BoardBanner;