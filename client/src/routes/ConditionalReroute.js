import React from "react";
import BoardRoute from "routes/board/BoardRoute";
import ProfileRoute from "routes/profile/ProfileRoute";
import {getEnvVar} from "utils/env-vars";

const ConditionalReroute = () => {
    const defaultBoard = getEnvVar("REACT_APP_DEFAULT_BOARD_REROUTE", null);

    if(defaultBoard == null) {
        return <ProfileRoute/>
    }
    return <BoardRoute defaultReroute={defaultBoard}/>
};

export default ConditionalReroute;