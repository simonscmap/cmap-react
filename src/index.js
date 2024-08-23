import React from 'react';
import { createRoot }from 'react-dom/client';
import './Stylesheets/index.css';
import 'ag-grid-enterprise';
import * as serviceWorker from './serviceWorker';
import { LicenseManager } from 'ag-grid-enterprise';
import { Provider } from 'react-redux';
import store from './Redux/store';
import App from './App';

LicenseManager.setLicenseKey('School_of_Oceanography_Simons_CMAP_1Devs_1Deployment_19_June_2020__MTU5MjUyMTIwMDAwMA==aec33f954c06d90afed06467402921bd');

const container = document.getElementById('root');
const root = createRoot (container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

serviceWorker.unregister();
