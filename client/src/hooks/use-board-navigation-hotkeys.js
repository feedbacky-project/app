import React from "react";
import {useHotkeys} from "react-hotkeys-hook";
import {useHistory} from "react-router-dom";

const useBoardNavigationHotkeys = id => {
    const history = useHistory();
    useHotkeys("shift+f", e => {
        e.preventDefault();
        history.push("/b/" + id);
    });
    useHotkeys("shift+c", e => {
        e.preventDefault();
        history.push("/b/" + id + "/changelog");
    });
    useHotkeys("shift+r", e => {
        e.preventDefault();
        history.push("/b/" + id + "/roadmap");
    });
};

export default useBoardNavigationHotkeys;