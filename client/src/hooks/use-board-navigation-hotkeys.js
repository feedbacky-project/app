import React from "react";
import {useHotkeys} from "react-hotkeys-hook";
import {useHistory} from "react-router-dom";

const useBoardNavigationHotkeys = () => {
    const history = useHistory();
    useHotkeys("shift+f", e => {
        e.preventDefault();
        history.push("/");
    });
    useHotkeys("shift+c", e => {
        e.preventDefault();
        history.push("/changelog");
    });
    useHotkeys("shift+r", e => {
        e.preventDefault();
        history.push("/roadmap");
    });
};

export default useBoardNavigationHotkeys;