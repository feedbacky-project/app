import React, {useContext} from 'react';
import {Col, Jumbotron} from "react-bootstrap";
import SafeAnchor from "components/app/safe-anchor";
import BoardContext from "context/board-context";
import {FaMap} from "react-icons/all";
import {Link} from "react-router-dom";
import AppContext from "context/app-context";

const BoardBanner = ({customName}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;
    const {socialLinks, name, shortDescription, banner, discriminator} = useContext(BoardContext).data;
    const renderSocialLinks = () => {
        let offset = 0;
        return <div className="d-none d-sm-block" style={{position: "relative", bottom: "-72px"}}>
            {socialLinks.map(link => {
                offset += 50;
                return <div key={link.id} className="social-link" style={{position: "absolute", bottom: "8px", left: (offset - 50) + "px"}}>
                    <SafeAnchor url={link.url}><img src={link.logoUrl} alt="Social Icon" width={18} height={18}/></SafeAnchor>
                </div>
            })}
            <div className="d-inline social-link" style={{position: "absolute", bottom: "8px", left: (offset) + "px", backgroundColor: context.getTheme().setAlpha(.5)}}>
                <Link to={{
                    pathname: "/b/" + discriminator + "/roadmap",
                    state: {_boardData: boardData}
                }}><FaMap style={{color: "white"}}/></Link>
            </div>
        </div>
    };

    const renderSocialLinksMobile = () => {
        return <div className="d-inline-block d-sm-none" style={{position: "relative", bottom: "-26px", height: 0}}>
            {socialLinks.map(link => {
                return <div key={link.id} className="d-inline social-link">
                    <SafeAnchor url={link.url}><img src={link.logoUrl} alt="Social Icon" width={18} height={18} className="img-fluid"/></SafeAnchor>
                </div>
            })}
            <div className="d-inline social-link" style={{backgroundColor: context.getTheme().setAlpha(.5)}}>
                <Link to={{
                    pathname: "/b/" + discriminator + "/roadmap",
                    state: {_boardData: boardData}
                }}><FaMap style={{color: "white"}}/></Link>
            </div>
        </div>
    };

    return <Col sm={12} className="mt-3">
        <Jumbotron className="mb-2 small-text-shadow" style={{backgroundImage: `url("` + banner + `")`}}>
            <h3 style={{fontWeight: 500}}>{customName || name}</h3>
            <h5 style={{fontWeight: 300}} dangerouslySetInnerHTML={{__html: shortDescription}}/>
            {renderSocialLinks()}
            {renderSocialLinksMobile()}
        </Jumbotron>
    </Col>
};

export default BoardBanner;