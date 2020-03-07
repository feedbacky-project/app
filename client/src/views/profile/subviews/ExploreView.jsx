import React from 'react';
import ExploreElement from "../../../components/profile/ExploreElement";
import ProfileSidebar from "../../../components/sidebar/ProfileSidebar";
import {Col, Row} from "react-bootstrap";

const ExploreView = (props) => {
    return <React.Fragment>
        <ProfileSidebar currentNode="explore" reRouteTo={props.reRouteTo}/>
        <Col xs={12} md={9} className="mt-4">
            <h2 className="h2-responsive mb-3">Explore More Boards</h2>
            <Col className="mb-3">
                <Row className="py-4 px-sm-2 px-0 rounded-top box-overlay">
                    <ExploreElement/>
                </Row>
            </Col>
        </Col>
    </React.Fragment>
};

export default ExploreView;