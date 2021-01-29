import App from 'App.js';
import 'assets/scss/main.scss';
import ErrorBoundary from "ErrorBoundary";
import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter} from "react-router-dom";

render(<BrowserRouter><ErrorBoundary><App /></ErrorBoundary></BrowserRouter>, document.getElementById('root'));
