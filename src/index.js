import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { LicenseManager } from 'ag-grid-enterprise';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import * as serviceWorker from './serviceWorker';
import store from './Redux/store';
import App from './App';
import './Stylesheets/index.css';
import 'ag-grid-enterprise';

LicenseManager.setLicenseKey(
  'School_of_Oceanography_Simons_CMAP_1Devs_1Deployment_19_June_2020__MTU5MjUyMTIwMDAwMA==aec33f954c06d90afed06467402921bd',
);

Object.assign(window, { cmapStore: store });

serviceWorker.unregister();

// `npm run start:sentry` will set process.env.REACT_APP_ENABLE_SENTRY to true
// for enabling Sentry locally
if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging' ||
  process.env.REACT_APP_ENABLE_SENTRY === 'true'
) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    release: process.env.REACT_APP_SENTRY_RELEASE || 'development',
    environment: process.env.NODE_ENV,

    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [new Integrations.BrowserTracing()],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

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
