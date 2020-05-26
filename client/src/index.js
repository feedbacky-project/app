import React from 'react';
import {render} from 'react-dom';
import 'index.scss';
import App from 'components/app/app.js';
import {BrowserRouter} from "react-router-dom";
import ErrorBoundary from "components/util/error-boundary";

render(<BrowserRouter><ErrorBoundary><App /></ErrorBoundary></BrowserRouter>, document.getElementById('root'));
