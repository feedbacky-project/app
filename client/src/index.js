import React from 'react';
import {render} from 'react-dom';
import './mdbootstrap.lite.css';
import './bootstrap.css';
import './index.css';
import App from './components/app/app.js';
import {BrowserRouter} from "react-router-dom";

render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
