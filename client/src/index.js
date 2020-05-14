import React from 'react';
import {render} from 'react-dom';
import 'index.scss';
import App from 'components/app/app.js';
import {BrowserRouter} from "react-router-dom";

render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
