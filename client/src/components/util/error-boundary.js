import React, {Component} from "react";
import ErrorView from "views/errors/error-view";
import {FaBomb} from "react-icons/all";

class ErrorBoundary extends Component {
    state = {
        hasError: false,
        data: null
    };

    static getDerivedStateFromError(error) {
        return {hasError: true, data: error};
    }

    render() {
        if (this.state.hasError) {
            console.error("-- APPLICATION HAS CRASHED --");
            console.error("Crash log:");
            console.error(this.state.data);
            return <ErrorView icon={<FaBomb className="error-icon"/>} message="Application Has Crashed, Please Refresh The Page" notes="Additionally, crash log has been printed in the console."/>
        }
        return this.props.children;
    }
}

export default ErrorBoundary;