import React, {useContext, useEffect, useState} from 'react';
import {CardDeck, Container, Row} from "react-bootstrap";
import axios from "axios";
import ExploreBox from "./ExploreBox";
import LoadingSpinner from "../util/LoadingSpinner";
import AppContext from "../../context/AppContext";

const ExploreElement = () => {
    const context = useContext(AppContext);
    const [featuredBoards, setFeaturedBoards] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        //the only exception for using session storage, not critical part of code
        const featured = sessionStorage.getItem("featuredBoards");
        if (featured !== null) {
            setFeaturedBoards(JSON.parse(featured));
            setLoaded(true);
            return;
        }
        axios.get(context.apiRoute + "/featured_boards")
            .then(res => {
                const data = res.data;
                sessionStorage.setItem("featuredBoards", JSON.stringify(data));
                setFeaturedBoards(data);
                setLoaded(true);
            });
    }, []);

    const renderFeaturedBoards = () => {
        if (!loaded) {
            return <div className="mt-5"><LoadingSpinner/></div>
        }
        return featuredBoards.map(boardData => {
            return <ExploreBox key={boardData.id} name={boardData.name} description={boardData.shortDescription}
                               banner={boardData.banner} logo={boardData.logo}
                               discriminator={boardData.discriminator}/>
        });
    };

    return <Container>
        <Row className="justify-content-center text-center">
            <CardDeck id="profile-featured" className="col-12 row justify-content-center">
                {renderFeaturedBoards()}
            </CardDeck>
        </Row>
    </Container>
};

export default ExploreElement;