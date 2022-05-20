import AppAppearance from "AppAppearance";
import 'assets/scss/main.scss';
import ErrorBoundary from "ErrorBoundary";
import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<BrowserRouter><ErrorBoundary><AppAppearance/></ErrorBoundary></BrowserRouter>);