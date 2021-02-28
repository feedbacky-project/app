import styled from "@emotion/styled";
import AppContext from "context/AppContext";
import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import tinycolor from "tinycolor2";
import {UiButton} from "ui/button";
import {UiCol, UiContainer, UiRow} from "ui/grid";
import {useTitle} from "utils/use-title";

const ErrorIcon = styled.div`
  font-size: 110px;
  color: hsl(355, 100%, 60%);
`;

const ErrorRoute = ({Icon, message, notes = "", crash = false, onBackButtonClick = () => void 0}) => {
    const {hardResetData} = useContext(AppContext);
    useTitle(message);
    return <UiContainer>
        <UiRow centered verticallyCentered>
            <UiCol className={"text-md-left justify-content-center text-center d-sm-flex d-block"}>
                <ErrorIcon className={"mr-sm-5 mr-0"}><Icon/></ErrorIcon>
                <div>
                    <h1 className={"display-4"}>Oh Noes!</h1>
                    <h3 className={"mb-0"}>{message}</h3>
                    {notes && <div className={"my-1"}>{notes}</div>}
                    <Link to={"/"} onClick={onBackButtonClick}>
                        <UiButton label={"Go Back"} color={tinycolor("#ff3547")} className={"mx-0 py-3 px-4 mt-1"}>
                            Back to the Main Page
                        </UiButton>
                    </Link>
                    {crash && <UiButton label={"Reset Data"} color={tinycolor("#e0a800")} className={"mx-0 py-3 px-4 mt-1 ml-3"} onClick={() => hardResetData()}>
                        Reset Data
                    </UiButton>}
                </div>
            </UiCol>
        </UiRow>
    </UiContainer>
};

export default ErrorRoute;