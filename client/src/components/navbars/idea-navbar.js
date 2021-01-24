import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {Container, NavbarBrand} from "react-bootstrap";
import AppContext from "context/app-context";
import {renderLogIn} from "components/navbars/navbar-commons";
import PageNavbar from "components/navbars/page-navbar";
import BoardContext from "context/board-context";

const IdeaNavbar = ({onNotLoggedClick}) => {
    const context = useContext(AppContext);
    const boardData = useContext(BoardContext).data;

    return <PageNavbar>
        <Link to={{
            pathname: "/b/" + boardData.discriminator,
            state: {_boardData: boardData}
        }} className="d-none d-md-block go-back-button hoverable-option justify-content-start" style={{position: "absolute"}}>
            <FaChevronLeft className="ml-2"/>
        </Link>
        <Container className="d-flex">
            <NavbarBrand as={Link} to={{
                pathname: "/b/" + boardData.discriminator,
                state: {_boardData: boardData}
            }}>
                <img className="mr-2" src={boardData.logo}
                     height="30px"
                     width="30px" alt=""/>
                <span>{boardData.name}</span>
            </NavbarBrand>
            <div className="ml-auto py-0 text-nowrap">
                {renderLogIn(onNotLoggedClick, context)}
            </div>
        </Container>
    </PageNavbar>
};

export default IdeaNavbar;