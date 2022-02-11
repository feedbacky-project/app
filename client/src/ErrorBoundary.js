import React, {Component} from "react";
import {FaBomb} from "react-icons/all";
import ErrorRoute from "routes/ErrorRoute";

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
            return <ErrorRoute crash Icon={FaBomb} message={"Application Has Crashed, Please Refresh The Page"}
                               notes={"Additionally, crash log has been printed in the console. Click Reset Data button to attempt to fix the application."}
                               onBackButtonClick={() => this.setState({hasError: false})}/>
        }
        return this.props.children;
    }
}

export default ErrorBoundary;