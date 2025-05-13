import React from 'react';
import ReactDOM from 'react-dom';
import './Stylesheets/index.css';
import 'ag-grid-enterprise';

import * as serviceWorker from './serviceWorker';

import { Provider } from 'react-redux';
import store from './Redux/store';

import App from './App';

import { LicenseManager } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey(
  'School_of_Oceanography_Simons_CMAP_1Devs_1Deployment_19_June_2020__MTU5MjUyMTIwMDAwMA==aec33f954c06d90afed06467402921bd',
);

const rootElement = document.getElementById('root');

// We're using React 16.13.1 where ReactDOM.render is the standard API.
// The createRoot API is not available in React 16, so this warning can be safely ignored.
/* eslint-disable react/no-deprecated */
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement,
);

Object.assign(window, { cmapStore: store });

serviceWorker.unregister();
