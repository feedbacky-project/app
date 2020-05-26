import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {Container, NavbarBrand} from "react-bootstrap";
import AppContext from "context/app-context";
import {renderLogIn} from "components/navbars/navbar-commons";
import PageNavbar from "components/navbars/page-navbar";

const IdeaNavbar = (props) => {
    const context = useContext(AppContext);
    const theme = context.getTheme();

    return <PageNavbar theme={theme}>
        <Link to={{
            pathname: "/b/" + props.boardData.discriminator,
            state: {_boardData: props.boardData}
        }} className="d-none d-md-block go-back-button justify-content-start" style={{position: "absolute"}}>
            <FaChevronLeft className="ml-2"/>
        </Link>
        <Container className="d-flex">
            <NavbarBrand as={Link} to={{
                pathname: "/b/" + props.boardData.discriminator,
                state: {_boardData: props.boardData}
            }}>
                <img className="img-responsive mr-2" src={props.boardData.logo}
                     height="30px"
                     width="30px" alt=""/>
                <span>{props.boardData.name}</span>
            </NavbarBrand>
            <div className="ml-auto py-0 text-nowrap">
                {renderLogIn(props.onNotLoggedClick, context)}
            </div>
        </Container>
    </PageNavbar>
};

export default IdeaNavbar;