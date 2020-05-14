import React from 'react';
import {Col, Jumbotron} from "react-bootstrap";

const BoardBanner = (props) => {
    const renderSocialLinks = () => {
        if (props.socialLinks.length === 0) {
            return <React.Fragment/>
        }
        let offset = 0;
        return <div className="d-none d-sm-block" style={{position: "relative", bottom: "-72px"}}>
            {props.socialLinks.map(link => {
                offset += 50;
                return <div key={link.id} className="social-link p-2 px-3" style={{position: "absolute", bottom: "8px", left: (offset - 50) + "px", backgroundColor: "rgba(0,0,0,.4)"}}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"><img src={link.logoUrl} alt="Social Icon" width={18} height={18}/></a>
                </div>
            })}
        </div>
    };

    const renderSocialLinksMobile = () => {
        if (props.socialLinks.length === 0) {
            return <React.Fragment/>
        }
        return <div className="d-inline-block d-sm-none" style={{position: "relative", bottom: "-26px", height: 0}}>
            {props.socialLinks.map(link => {
                return <div key={link.id} className="d-inline social-link p-2 px-3" style={{backgroundColor: "rgba(0,0,0,.4)"}}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"><img src={link.logoUrl} alt="Social Icon" width={18} className="img-fluid"/></a>
                </div>
            })}
        </div>
    };

    return <Col sm={12} className="mt-3">
        <Jumbotron className="mb-2 small-text-shadow dark-mask"
                   style={{backgroundImage: `url("` + props.bannerUrl + `")`}}>
            <h3 className="h3-responsive" style={{fontWeight: 500}}>{props.name}</h3>
            <h5 className="h5-responsive" style={{fontWeight: 300}} dangerouslySetInnerHTML={{__html: props.description}}/>
            {renderSocialLinks()}
            {renderSocialLinksMobile()}
        </Jumbotron>
    </Col>
};

export default BoardBanner;