import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';

import 'normalize.css';

import "./lib/i18n";

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
