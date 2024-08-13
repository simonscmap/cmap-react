import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { LicenseManager } from 'ag-grid-enterprise';

import App from './App';
import store from './Redux/store';
import './Stylesheets/index.css';
import 'ag-grid-enterprise';

LicenseManager.setLicenseKey(
  'School_of_Oceanography_Simons_CMAP_1Devs_1Deployment_19_June_2020__MTU5MjUyMTIwMDAwMA==aec33f954c06d90afed06467402921bd',
);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
