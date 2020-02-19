import React from 'react';
import {Link} from "react-router-dom";

const ExploreBox = (props) => {
    return <Link to={"/b/" + props.discriminator} style={{textDecoration: "none"}}>
        <div className='card card-image profile-card my-1 mx-1'
             style={{
                 backgroundImage: "url('" + props.banner + "')",
                 backgroundSize: "cover",
                 minWidth: 220,
                 borderRadius: 0
             }}>
            <div className="text-white py-2 d-flex align-items-center dark-mask">
                <div className="card-body text-white small-text-shadow">
                    <img alt='Board' src={props.logo} width='60px' height='60px' className="mb-1"/>
                    <br/>
                    <span className='h4-responsive text-truncate' style={{fontWeight: 500}}>{props.name}</span>
                    <p className='px-2 mb-0 small text-truncate' style={{letterSpacing: "-.35pt", maxWidth: 180}} dangerouslySetInnerHTML={{__html: props.description}}/>
                </div>
            </div>
        </div>
    </Link>
};

export default ExploreBox;